'use client';

import { useState } from 'react';
import { UserSituation } from '@/lib/aid-programs';
import { getGeminiModel } from '@/lib/firebase/ai';

interface ConversationalIntakeProps {
  onComplete: (situation: UserSituation) => void;
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export default function ConversationalIntake({ onComplete }: ConversationalIntakeProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hi! I'm here to help you find disaster aid programs. Feel free to ask me any questions about available aid, eligibility, or the application process. I'll also ask you a few questions about your situation to find the programs that match your needs." 
    }
  ]);
  const [userSituation, setUserSituation] = useState<Partial<UserSituation>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Use Firebase AI to handle conversation
  const handleConversation = async (userMessage: string): Promise<string> => {
    try {
      const model = getGeminiModel();
      
      const currentSituation = JSON.stringify(userSituation, null, 2);
      
      const prompt = `You are a helpful assistant for disaster aid applications. Your role is to:

1. Answer user questions about disaster aid programs, eligibility, and the application process
2. Proactively gather information about the user's situation when needed
3. Determine when you have enough information to show eligible programs

Current information gathered about the user:
${currentSituation || "None yet"}

Required information to determine eligibility:
- county: The county where the user is located
- damageType: Type of property damaged (home, business, both, other)
- ownershipStatus: Whether they own, rent, or both
- damageSeverity: How severe the damage is (minor, moderate, severe, destroyed)
- hasInsurance: Whether they have insurance coverage
- isFarmer: Whether they are a farmer or own agricultural land
- incomeRange: Their household income range (low, medium, high, prefer_not_to_say)
- hasAppliedToFEMA: Whether they have already applied for FEMA assistance

User message: "${userMessage}"

Respond naturally and conversationally. If the user asks a question, answer it helpfully. If you need more information to determine eligibility, ask for it naturally in the flow of conversation. If you have all required information, say "I have all the information I need. Let me find the programs you qualify for." and then return a JSON object with the complete user situation.

Keep your response conversational and friendly. If returning JSON, format it as:
\`\`\`json
{"county": "...", "damageType": "...", ...}
\`\`\``;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Check if response contains JSON
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          return JSON.stringify({ hasCompleteInfo: true, situation: parsed, message: responseText.replace(jsonMatch[0], '').trim() });
        } catch (e) {
          console.error('Failed to parse JSON from AI response:', e);
        }
      }
      
      return responseText;
    } catch (error) {
      console.error('AI conversation error:', error);
      return "I'm having trouble understanding. Could you rephrase that?";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
    
    const userMessage = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Use AI to handle conversation
    try {
      const response = await handleConversation(userMessage);
      
      // Check if AI returned complete information
      try {
        const parsed = JSON.parse(response);
        if (parsed.hasCompleteInfo) {
          // Update situation with complete info
          setUserSituation(parsed.situation);
          
          // Add the conversational part of the response
          setMessages(prev => [...prev, { role: 'assistant', content: parsed.message }]);
          
          // Complete after showing the message
          setTimeout(() => {
            onComplete(parsed.situation as UserSituation);
          }, 2000);
        }
      } catch (e) {
        // Regular conversational response
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      console.error('Error in conversation:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble right now. Please try again." }]);
    }

    setIsTyping(false);
  };

  const handleRestart = () => {
    setMessages([{ 
      role: 'assistant', 
      content: "Hi! I'm here to help you find disaster aid programs. Feel free to ask me any questions about available aid, eligibility, or the application process. I'll also ask you a few questions about your situation to find the programs that match your needs." 
    }]);
    setUserSituation({});
    setInputValue('');
  };

  const handleShowResults = () => {
    // Allow user to manually trigger results even if not all info is gathered
    if (Object.keys(userSituation).length > 0) {
      onComplete(userSituation as UserSituation);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-[34px] text-center">
        <p className="mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
          Conversational Intake
        </p>
        <h2 className="font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
          Let's Find Your Aid Programs
        </h2>
        <p className="text-[#6b5a4e] text-[1.05rem] max-w-2xl mx-auto">
          Ask me anything about disaster aid, or just start telling me about your situation. I'll guide you through finding the right programs.
        </p>
      </div>

      {/* Chat Interface */}
      <div className="bg-[#faf6f1] rounded-[14px] shadow-lg border border-[#e4d9cf] overflow-hidden">
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
            
            {Object.keys(userSituation).length > 0 && (
              <button
                onClick={handleShowResults}
                className="text-[#b0673f] hover:text-[#895031] font-medium text-sm"
              >
                Show Results ({Object.keys(userSituation).length}/8 fields)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info gathered indicator */}
      {Object.keys(userSituation).length > 0 && (
        <div className="mt-6 bg-[#faf6f1] rounded-[14px] p-4 border border-[#e4d9cf]">
          <p className="text-sm text-[#895031] font-semibold uppercase tracking-[0.08em] mb-2">
            Information Gathered
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(userSituation).map(([key, value]) => (
              <span key={key} className="text-xs bg-white border border-[#e4d9cf] px-2 py-1 rounded-full text-[#6b5a4e]">
                {key}: {String(value)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
