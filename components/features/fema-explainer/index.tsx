'use client';

import { useState } from 'react';
import { getJsonModel, isAIBusyError, AI_BUSY_MESSAGE } from '@/lib/firebase/ai';
import { CompleteIcon } from '@/components/feature-icons';
import type { UserSituation } from '@/lib/aid-programs';

interface AnalysisResult {
  status: string;
  meaning: string;
  nextSteps: string[];
  appealInfo?: string;
  amount?: string;
  deadline?: string;
}

type Step = 'upload' | 'analyzing' | 'results' | 'walkthrough';

// SAMPLE LETTER — FABRICATED FOR DEMO PURPOSES ONLY. This is not a real FEMA
// document; it exists purely so a presenter can click "Try a sample letter"
// during a live demo instead of needing a real letter on hand.
const SAMPLE_FEMA_LETTER = `[SAMPLE LETTER — FABRICATED FOR DEMO PURPOSES ONLY. NOT A REAL FEMA DOCUMENT.]

FEDERAL EMERGENCY MANAGEMENT AGENCY
Individual Assistance Program
Disaster Declaration: DR-4827-NC — Hurricane Helene

Applicant: Jordan A. Sample
Application Number: 123-4567890
Property Address: 142 Maple Hollow Road, Asheville, NC 28801

Dear Jordan A. Sample,

Thank you for applying for FEMA Individual Assistance following Hurricane Helene. FEMA has reviewed your application and the inspection report for your damaged property.

DETERMINATION: Your application for FEMA assistance has been DENIED.

Reason for this decision: Based on the inspection completed on October 3, 2026, FEMA determined that the damage to your home is insufficient to make your home unsafe, unsanitary, or uninhabitable. Our records show the reported damage does not meet FEMA's threshold for a finding of disaster-caused damage that renders the home uninhabitable. Additionally, FEMA was unable to verify occupancy at the address listed on your application.

Rental Assistance: If your home is uninhabitable because of the disaster, you may be eligible for Rental Assistance of up to $2,453.00 to help with the cost of temporary housing while repairs are made. Because your application was denied for insufficient damage, this amount has NOT been awarded at this time.

Your Right to Appeal: If you disagree with this determination, you have the right to appeal within 60 days of the date of this letter. Your appeal must be submitted in writing, along with any new information or documentation (such as a contractor's estimate, insurance denial, or photos of the damage) that supports your case.

APPEAL DEADLINE: December 15, 2026

You can submit your appeal by mail, fax, or by uploading it to your online account at DisasterAssistance.gov. For questions, call the FEMA Helpline at 1-800-621-3362.

Sincerely,
FEMA Individual Assistance Program

[END OF SAMPLE LETTER — FABRICATED FOR DEMO PURPOSES ONLY. NOT A REAL FEMA DOCUMENT.]`;

// Even in JSON mode the model occasionally still wraps its reply in a
// ```json ... ``` (or plain ```) code fence. Strip that before JSON.parse so
// analysis doesn't fail with "Failed to analyze the letter" on those replies.
function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

// Turns a saved UserSituation into a short bullet list of facts the prompt
// can use to personalize nextSteps (e.g. mentioning the user's vehicle or
// county) instead of generating a generic, one-size-fits-all plan.
function buildSituationContext(situation: Partial<UserSituation>): string {
  const facts: string[] = [];
  if (situation.county) facts.push(`Lives in/was affected in ${situation.county}.`);
  if (situation.damageType) facts.push(`Reported damage type: ${situation.damageType}.`);
  if (situation.ownershipStatus) facts.push(`Ownership status: ${situation.ownershipStatus}.`);
  if (situation.damageSeverity) facts.push(`Reported damage severity: ${situation.damageSeverity}.`);
  if (situation.hasInsurance !== undefined) {
    facts.push(`Has relevant insurance coverage: ${situation.hasInsurance ? 'yes' : 'no'}.`);
  }
  if (situation.vehicleDamaged) {
    facts.push('Their vehicle was damaged or lost in the disaster — if relevant, mention vehicle/transportation assistance or replacing documentation for the vehicle in the next steps.');
  }
  if (situation.hasAppliedToFEMA !== undefined) {
    facts.push(`Has already applied for FEMA Individual Assistance: ${situation.hasAppliedToFEMA ? 'yes' : 'no'}.`);
  }
  if (situation.incomeRange) facts.push(`Household income range: ${situation.incomeRange}.`);
  if (situation.isFarmer) facts.push('Is a farmer or owns agricultural land — mention USDA/Farm Service Agency resources if relevant.');
  if (situation.primaryNeed) facts.push(`Told us their primary need is: ${situation.primaryNeed}.`);
  if (situation.supplementaryNeeds?.length) {
    facts.push(`Also mentioned these additional needs: ${situation.supplementaryNeeds.join(', ')}.`);
  }
  if (facts.length === 0) return '';
  return `\nThe signed-in user has previously told us about their own situation (separate from anything stated in the letter). Use these facts to make the "nextSteps" concrete and personalized — e.g. naming their county or mentioning their damaged vehicle — but never invent facts beyond what's listed here or stated in the letter itself:\n${facts.map((f) => `- ${f}`).join('\n')}\n`;
}

export default function FemaExplainer() {
  const [letterText, setLetterText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  const steps = [
    { id: 'upload', label: 'Paste Letter', icon: '1' },
    { id: 'analyzing', label: 'Analyzing', icon: '2' },
    { id: 'results', label: 'Results', icon: '3' },
    { id: 'walkthrough', label: 'Next Steps', icon: '4' },
  ];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterText.trim()) return;

    setError(null);
    setAnalysis(null);
    setCurrentStep('analyzing');

    try {
      // Load the signed-in user's saved situation (if any) so the generated
      // plan can be personalized. Degrades silently to a non-personalized
      // plan when the user isn't signed in, has no saved situation, or the
      // request fails for any reason.
      let situationContext = '';
      try {
        const situationRes = await fetch('/api/user-situation');
        if (situationRes.ok) {
          const data = await situationRes.json();
          if (data?.situation) {
            situationContext = buildSituationContext(data.situation as Partial<UserSituation>);
          }
        }
      } catch (situationError) {
        console.error('Error loading user situation for FEMA plan personalization:', situationError);
      }

      const prompt = `You are an expert at interpreting FEMA disaster assistance letters. Analyze the following FEMA letter and provide a clear, easy-to-understand explanation.

FEMA Letter:
"""
${letterText}
"""
${situationContext}
Based on FEMA's official guidance, analyze the letter for:
1. Application status (Under Review, Approved, Denied, Additional Information Needed, Ineligible, etc.)
2. Assistance amount if approved
3. Any deadlines mentioned (appeal deadlines, document submission deadlines, etc.)
4. Specific reasons for decisions
5. Required actions from the applicant
6. Appeal rights and procedures if applicable

Extract the following information and return ONLY a JSON object with this exact structure:
{
  "status": "The current status of the application",
  "meaning": "A plain English explanation of what this status means for the user, based on FEMA's official guidance",
  "nextSteps": ["List of specific next steps the user should take based on the letter content", "Step 2", "Step 3"],
  "amount": "The dollar amount if approved, or null if not mentioned",
  "deadline": "Any important deadline mentioned (appeal deadline, document submission deadline, etc.), or null if not applicable",
  "appealInfo": "Information about appeal process if denied or ineligible, including the 60-day appeal window and FEMA helpline (1-800-621-3362), or null if not applicable"
}

Be specific and accurate. If information is not in the letter, use null for that field. 
For denied applications, always mention the 60-day appeal window and the FEMA helpline.
For "Additional Information Needed" status, emphasize the importance of responding promptly.
Return ONLY the JSON, no other text.`;

      const result = await getJsonModel().generateContent(prompt);
      const responseText = result.response.text();
      const parsed = JSON.parse(stripJsonFences(responseText));
      setAnalysis(parsed);
      setCurrentStep('results');
    } catch (err) {
      console.error('AI analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(
        isAIBusyError(err)
          ? AI_BUSY_MESSAGE
          : `Failed to analyze the letter: ${errorMessage}. Please try again or make sure you have pasted the full letter text.`
      );
      setCurrentStep('upload');
    } finally {
    }
  };

  const handleStartWalkthrough = () => {
    setCurrentStep('walkthrough');
    setWalkthroughStep(0);
  };

  const handleNextWalkthrough = () => {
    if (analysis && walkthroughStep < analysis.nextSteps.length) {
      setWalkthroughStep(walkthroughStep + 1);
    }
  };

  const handlePreviousWalkthrough = () => {
    if (walkthroughStep > 0) {
      setWalkthroughStep(walkthroughStep - 1);
    }
  };

  const handleReset = () => {
    setLetterText('');
    setAnalysis(null);
    setError(null);
    setCurrentStep('upload');
    setWalkthroughStep(0);
  };

  const getStepIndex = () => steps.findIndex(s => s.id === currentStep);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
          FEMA Letter Help
        </p>
        <h1 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
          Understand Your FEMA Letter
        </h1>
        <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] max-w-2xl mx-auto">
          We&apos;ll help you understand your FEMA letter in plain English and show you what to do next.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="ac-reveal-3 flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = getStepIndex() > index;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                    isActive
                      ? 'bg-[#b0673f] text-white scale-110'
                      : isCompleted
                      ? 'bg-[#10b981] text-white'
                      : 'bg-[#e4d9cf] text-[#6b5a4e]'
                  }`}
                >
                  {isCompleted ? <CompleteIcon /> : step.icon}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isActive ? 'text-[#b0673f]' : isCompleted ? 'text-[#10b981]' : 'text-[#6b5a4e]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 rounded ${
                    isCompleted ? 'bg-[#10b981]' : 'bg-[#e4d9cf]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Step */}
      {currentStep === 'upload' && (
        <div className="ac-reveal-3 bg-[#faf6f1] rounded-[14px] p-8 border border-[#e4d9cf]">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#b0673f] flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="font-serif text-[1.5rem] font-medium text-[#1f1610] mb-2">
              Paste Your FEMA Letter
            </h3>
            <p className="text-[#6b5a4e]">
              Paste the full text of your FEMA letter or status update below
            </p>
          </div>
          <form onSubmit={handleAnalyze}>
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setLetterText(SAMPLE_FEMA_LETTER)}
                className="text-sm font-medium text-[#b0673f] hover:text-[#895031] underline underline-offset-2 transition-colors"
              >
                Try a sample letter
              </button>
            </div>
            <textarea
              id="letter"
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              placeholder="Paste the full text of your FEMA letter or status update..."
              rows={12}
              className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow resize-none"
              required
            />
            <div className="mt-6 flex justify-center">
              <button
                type="submit"
                disabled={!letterText.trim()}
                className="bg-[#3d2b20] text-white px-8 py-4 rounded-[10px] font-semibold text-[1.1rem] hover:bg-[#2b1e15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze My Letter →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Analyzing Step */}
      {currentStep === 'analyzing' && (
        <div className="ac-reveal-3 bg-[#faf6f1] rounded-[14px] p-12 border border-[#e4d9cf] text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#b0673f] flex items-center justify-center animate-pulse">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h3 className="font-serif text-[1.5rem] font-medium text-[#1f1610] mb-4">
            Analyzing Your Letter
          </h3>
          <p className="text-[#6b5a4e] mb-6">
            Our AI is reviewing your FEMA letter to understand your status and next steps...
          </p>
          <div className="w-full max-w-md mx-auto bg-[#e4d9cf] rounded-full h-2">
            <div className="bg-[#b0673f] h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* Results Step */}
      {currentStep === 'results' && analysis && (
        <div className="ac-reveal space-y-6">
          {/* Status Card */}
          <div className="bg-[#3d2b20] rounded-[14px] p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-[1.5rem] font-medium">Your Status</h3>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold mb-2">{analysis.status}</p>
            <p className="text-[#eaddd0]">{analysis.meaning}</p>
          </div>

          {/* Key Details */}
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.amount && (
              <div className="bg-[#faf6f1] border border-[#e4d9cf] rounded-[14px] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#b0673f] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[#895031]">Assistance Amount</h4>
                </div>
                <p className="text-[#1f1610] font-medium text-xl">{analysis.amount}</p>
              </div>
            )}
            {analysis.deadline && (
              <div className="bg-[#faf6f1] border border-[#e4d9cf] rounded-[14px] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#b0673f] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[#895031]">Important Deadline</h4>
                </div>
                <p className="text-[#1f1610]">{analysis.deadline}</p>
              </div>
            )}
          </div>

          {/* Appeal Warning */}
          {analysis.appealInfo && (
            <div className="bg-[#fffbeb] border-2 border-[#f59e0b] rounded-[14px] p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f59e0b] flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-[#b0673f] mb-2">Appeal Information</h4>
                  <p className="text-[#6b5a4e]">{analysis.appealInfo}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartWalkthrough}
              className="bg-[#b0673f] text-white px-8 py-4 rounded-[10px] font-semibold text-[1.1rem] hover:bg-[#895031] transition-colors"
            >
              Start Step-by-Step Guide →
            </button>
            <button
              onClick={handleReset}
              className="bg-[#faf6f1] text-[#1f1610] border border-[#e4d9cf] px-8 py-4 rounded-[10px] font-semibold text-[1.1rem] hover:bg-[#e4d9cf] transition-colors"
            >
              Analyze Another Letter
            </button>
          </div>
        </div>
      )}

      {/* Walkthrough Step */}
      {currentStep === 'walkthrough' && analysis && (
        <div className="ac-reveal space-y-6">
          <div className="bg-[#faf6f1] rounded-[14px] p-8 border border-[#e4d9cf]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-[1.5rem] font-medium text-[#1f1610]">
                Your Action Plan
              </h3>
              <div className="text-sm text-[#6b5a4e]">
                Step {walkthroughStep + 1} of {analysis.nextSteps.length}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#e4d9cf] rounded-full h-2 mb-8">
              <div
                className="bg-[#b0673f] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((walkthroughStep + 1) / analysis.nextSteps.length) * 100}%` }}
              />
            </div>

            {/* Current Step */}
            {walkthroughStep < analysis.nextSteps.length ? (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#b0673f] flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="bg-white border border-[#e4d9cf] rounded-[14px] p-8 mb-8">
                  <p className="text-[#1f1610] text-xl font-medium leading-relaxed">
                    {analysis.nextSteps[walkthroughStep]}
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handlePreviousWalkthrough}
                    disabled={walkthroughStep === 0}
                    className="bg-[#faf6f1] text-[#1f1610] border border-[#e4d9cf] px-6 py-3 rounded-[10px] font-semibold hover:bg-[#e4d9cf] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={handleNextWalkthrough}
                    disabled={walkthroughStep === analysis.nextSteps.length - 1}
                    className="bg-[#b0673f] text-white px-6 py-3 rounded-[10px] font-semibold hover:bg-[#895031] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {walkthroughStep === analysis.nextSteps.length - 1 ? 'Complete' : 'Next →'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#10b981] flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4 className="font-serif text-[1.5rem] font-medium text-[#1f1610] mb-4">
                  You&apos;re All Set!
                </h4>
                <p className="text-[#6b5a4e] mb-8">
                  You&apos;ve gone through every step in your action plan. If anything changes with your case, come back and re-run the analysis on the new letter.
                </p>
                <button
                  onClick={handleReset}
                  className="bg-[#3d2b20] text-white px-8 py-4 rounded-[10px] font-semibold text-[1.1rem] hover:bg-[#2b1e15] transition-colors"
                >
                  Analyze Another Letter
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Section */}
      {error && (
        <div className="ac-reveal bg-[#fee2e2] border-2 border-[#dc2626] rounded-[14px] p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#dc2626] flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-[#dc2626] mb-2">Analysis Failed</h4>
              <p className="text-[#dc2626]">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-[#faf6f1] rounded-[14px] p-6 border border-[#e4d9cf]">
        <h3 className="font-serif text-[1.15rem] font-medium text-[#1f1610] mb-4">
          Common FEMA Status Codes
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#b0673f] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-[#1f1610] mb-1">Under Review</h4>
              <p className="text-[#6b5a4e]">Application is being processed</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-[#1f1610] mb-1">Approved</h4>
              <p className="text-[#6b5a4e]">Eligible for assistance</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#dc2626] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-[#1f1610] mb-1">Denied</h4>
              <p className="text-[#6b5a4e]">Not eligible - can appeal within 60 days</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f59e0b] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-[#1f1610] mb-1">Additional Info Needed</h4>
              <p className="text-[#6b5a4e]">FEMA requires more documentation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
