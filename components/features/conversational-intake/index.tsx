'use client';

import { useRef, useState } from 'react';
import type { ChatSession } from 'firebase/ai';
import { UserSituation } from '@/lib/aid-programs';
import type { UserSituation as DocumentRequirementsUserSituation } from '@/lib/document-requirements';
import { getGeminiModel, getSituationExtractionModel } from '@/lib/firebase/ai';
import { CompassStatus } from '@/components/compass-status';
import SituationIntake from '@/components/features/situation-intake';

interface ConversationalIntakeProps {
  onComplete: (situation: UserSituation) => void;
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

const GREETING =
  "Hi! I'm here to help you find disaster aid programs. Feel free to ask me any questions about available aid, eligibility, or the application process. I'll also ask you a few questions about your situation to find the programs that match your needs.";

const SYSTEM_INSTRUCTION = `You are a helpful assistant for disaster aid applications on Aid Compass. Your job is to:

1. Answer the user's questions about disaster aid programs, eligibility, and the application process, in a warm, concise, conversational tone.
2. Naturally ask about the following pieces of the user's situation, one or two at a time, only for whatever they haven't already told you:
   - county: the county they're located in
   - damageType: home, business, both, or other
   - ownershipStatus: owner, renter, or both
   - damageSeverity: minor, moderate, severe, or destroyed
   - hasInsurance: yes/no
   - isFarmer: yes/no (owns agricultural land)
   - incomeRange: low (under $50k), medium ($50k-$100k), high (over $100k), or prefer not to say
   - hasAppliedToFEMA: yes/no
3. Do not output JSON yourself, and do not use markdown code fences. Just respond in plain, natural language. A separate process extracts structured data from this conversation, so you never need to summarize it as data.
4. Once you believe you have enough information to be useful, tell the user you have what you need and that you're finding their matching programs.`;

const DAMAGE_TYPES = ['home', 'business', 'both', 'other'] as const;
const OWNERSHIP_STATUSES = ['owner', 'renter', 'both'] as const;
const DAMAGE_SEVERITIES = ['minor', 'moderate', 'severe', 'destroyed'] as const;
const INCOME_RANGES = ['low', 'medium', 'high', 'prefer_not_to_say'] as const;

const REQUIRED_FIELDS = [
  'county',
  'damageType',
  'ownershipStatus',
  'damageSeverity',
  'hasInsurance',
  'isFarmer',
  'incomeRange',
  'hasAppliedToFEMA',
] as const;

const ERROR_THRESHOLD = 3;

function validateSituation(raw: Record<string, unknown>): Partial<UserSituation> {
  const out: Partial<UserSituation> = {};

  if (typeof raw.county === 'string' && raw.county.trim().length > 0) {
    out.county = raw.county.trim();
  }
  if (typeof raw.damageType === 'string' && (DAMAGE_TYPES as readonly string[]).includes(raw.damageType)) {
    out.damageType = raw.damageType as UserSituation['damageType'];
  }
  if (
    typeof raw.ownershipStatus === 'string' &&
    (OWNERSHIP_STATUSES as readonly string[]).includes(raw.ownershipStatus)
  ) {
    out.ownershipStatus = raw.ownershipStatus as UserSituation['ownershipStatus'];
  }
  if (
    typeof raw.damageSeverity === 'string' &&
    (DAMAGE_SEVERITIES as readonly string[]).includes(raw.damageSeverity)
  ) {
    out.damageSeverity = raw.damageSeverity as UserSituation['damageSeverity'];
  }
  if (typeof raw.incomeRange === 'string' && (INCOME_RANGES as readonly string[]).includes(raw.incomeRange)) {
    out.incomeRange = raw.incomeRange as UserSituation['incomeRange'];
  }
  if (typeof raw.hasInsurance === 'boolean') out.hasInsurance = raw.hasInsurance;
  if (typeof raw.isFarmer === 'boolean') out.isFarmer = raw.isFarmer;
  if (typeof raw.hasAppliedToFEMA === 'boolean') out.hasAppliedToFEMA = raw.hasAppliedToFEMA;

  return out;
}

async function runExtraction(messages: Message[]): Promise<Partial<UserSituation>> {
  const transcript = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const prompt = `Given the following conversation transcript between a disaster aid assistant and a user, extract any of the situation fields that can be confidently determined from what the user has said. Omit any field not yet clearly stated by the user; do not guess.

Transcript:
${transcript}`;

  const result = await getSituationExtractionModel().generateContent(prompt);
  const parsed = JSON.parse(result.response.text());
  return validateSituation(parsed);
}

export default function ConversationalIntake({ onComplete }: ConversationalIntakeProps) {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: GREETING }]);
  const [userSituation, setUserSituation] = useState<Partial<UserSituation>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [useManualFallback, setUseManualFallback] = useState(false);

  const chatSessionRef = useRef<ChatSession | null>(null);

  const gatheredCount = REQUIRED_FIELDS.filter(
    (key) => userSituation[key] !== undefined
  ).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue;
    const messagesWithUser = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(messagesWithUser);
    setInputValue('');
    setIsTyping(true);

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = getGeminiModel().startChat({
          systemInstruction: SYSTEM_INSTRUCTION,
        });
      }

      const result = await chatSessionRef.current.sendMessage(userMessage);
      const replyText = result.response.text();
      const messagesWithReply = [...messagesWithUser, { role: 'assistant' as const, content: replyText }];
      setMessages(messagesWithReply);

      try {
        const validated = await runExtraction(messagesWithReply);
        if (Object.keys(validated).length > 0) {
          setUserSituation((prev) => ({ ...prev, ...validated }));
        }
      } catch (extractionError) {
        console.error('Failed to extract situation from conversation:', extractionError);
      }

      setErrorCount(0);
    } catch (error) {
      console.error('Error in conversation:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm sorry, I'm having trouble right now. Please try again." },
      ]);
      setErrorCount((prev) => prev + 1);
    }

    setIsTyping(false);
  };

  const handleRestart = () => {
    setMessages([{ role: 'assistant', content: GREETING }]);
    setUserSituation({});
    setInputValue('');
    setErrorCount(0);
    setUseManualFallback(false);
    chatSessionRef.current = null;
  };

  const handleShowResults = () => {
    if (gatheredCount > 0) {
      onComplete(userSituation as UserSituation);
    }
  };

  // lib/document-requirements.ts's UserSituation is a separately-declared type,
  // structurally identical to aid-programs.ts's for these 8 fields (see
  // CLAUDE.md "two parallel domain models" note).
  const handleManualSubmit = (situation: DocumentRequirementsUserSituation) => {
    onComplete(situation as unknown as UserSituation);
  };

  if (useManualFallback) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-[34px] text-center">
          <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
            Conversational Intake
          </p>
          <h1 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
            Let's Find Your Aid Programs
          </h1>
          <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] max-w-2xl mx-auto">
            No problem — fill out the quick form below instead.
          </p>
        </div>
        <SituationIntake onSubmit={handleManualSubmit} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-[34px] text-center">
        <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
          Conversational Intake
        </p>
        <h1 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
          Let's Find Your Aid Programs
        </h1>
        <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] max-w-2xl mx-auto">
          Ask me anything about disaster aid, or just start telling me about your situation. I'll guide you through finding the right programs.
        </p>
      </div>

      {/* Chat Interface */}
      <div className="ac-reveal-3 bg-[#faf6f1] rounded-[14px] border border-[#e4d9cf] overflow-hidden">
        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-[14px] ${
                  message.role === 'user'
                    ? 'bg-[#b0673f] text-white'
                    : 'bg-white border border-[#e4d9cf] text-[#1f1610]'
                }`}
              >
                <p className="text-[1.05rem] leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#e4d9cf] p-4 rounded-[14px]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-[#b0673f] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#b0673f] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-[#b0673f] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[#e4d9cf] p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question or tell me about your situation..."
              disabled={isTyping}
              className="flex-1 px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-[#3d2b20] text-white px-6 py-3 rounded-[10px] font-semibold text-[1.05rem] hover:bg-[#2b1e15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>

          <div className="flex justify-between items-center mt-3">
            <button
              onClick={handleRestart}
              className="text-[#895031] hover:text-[#6b5a4e] font-medium text-sm"
            >
              Start Over
            </button>

            {gatheredCount > 0 && (
              <button
                onClick={handleShowResults}
                className="text-[#b0673f] hover:text-[#895031] font-medium text-sm"
              >
                Show Results ({gatheredCount}/{REQUIRED_FIELDS.length} fields)
              </button>
            )}
          </div>

          {errorCount >= ERROR_THRESHOLD && (
            <div className="mt-4 bg-white rounded-[14px] p-4 border border-[#e4d9cf] flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <CompassStatus tone="attention" label="Having trouble" />
                <p className="text-sm text-[#6b5a4e]">
                  The assistant is having trouble right now. You can keep trying, or switch to the quick form instead.
                </p>
              </div>
              <button
                onClick={() => setUseManualFallback(true)}
                className="text-[#b0673f] hover:text-[#895031] font-medium text-sm whitespace-nowrap"
              >
                Use the form instead
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info gathered indicator */}
      {gatheredCount > 0 && (
        <div className="mt-6 bg-[#faf6f1] rounded-[14px] p-4 border border-[#e4d9cf]">
          <p className="text-sm text-[#895031] font-semibold uppercase tracking-[0.08em] mb-2">
            Information Gathered
          </p>
          <div className="flex flex-wrap gap-2">
            {REQUIRED_FIELDS.filter((key) => userSituation[key] !== undefined).map((key) => (
              <span key={key} className="text-xs bg-white border border-[#e4d9cf] px-2 py-1 rounded-full text-[#6b5a4e]">
                {key}: {String(userSituation[key])}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
