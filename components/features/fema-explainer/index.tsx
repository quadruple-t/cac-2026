'use client';

import { useState } from 'react';
import { getGeminiModel, isAIBusyError, AI_BUSY_MESSAGE } from '@/lib/firebase/ai';
import { AmountIcon, ClockIcon, CompleteIcon } from '@/components/feature-icons';
import { CompassStatus } from '@/components/compass-status';

interface AnalysisResult {
  status: string;
  meaning: string;
  nextSteps: string[];
  appealInfo?: string;
  amount?: string;
  deadline?: string;
}

type Step = 'upload' | 'analyzing' | 'results' | 'walkthrough';

export default function FemaExplainer() {
  const [letterText, setLetterText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  const steps = [
    { id: 'upload', label: 'Paste letter', icon: '1' },
    { id: 'analyzing', label: 'Reading', icon: '2' },
    { id: 'results', label: 'Results', icon: '3' },
    { id: 'walkthrough', label: 'Next steps', icon: '4' },
  ];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterText.trim()) return;

    setError(null);
    setAnalysis(null);
    setCurrentStep('analyzing');

    try {
      const model = getGeminiModel();
      const prompt = `You are an expert at interpreting FEMA disaster assistance letters. Analyze the following FEMA letter and provide a clear, easy-to-understand explanation.

FEMA Letter:
"""
${letterText}
"""

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

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = JSON.parse(responseText);
      setAnalysis(parsed);
      setCurrentStep('results');
    } catch (err) {
      console.error('AI analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(
        isAIBusyError(err)
          ? AI_BUSY_MESSAGE
          : `We couldn't read this letter (${errorMessage}). Check that you pasted the full text, then try again.`
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

  const commonStatuses = [
    { tone: 'progress' as const, name: 'Under review', meaning: 'FEMA is still processing your application.' },
    { tone: 'success' as const, name: 'Approved', meaning: 'You are eligible for assistance.' },
    { tone: 'attention' as const, name: 'Denied', meaning: 'Not approved. You can appeal within 60 days.' },
    { tone: 'attention' as const, name: 'More information needed', meaning: 'FEMA needs more documents from you.' },
  ];

  return (
    <div>
      {/* Progress steps */}
      <ol className="mb-10 grid grid-cols-4 gap-2 sm:gap-3" aria-label="Progress">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = getStepIndex() > index;
          const barColor = isActive ? '#b0673f' : isCompleted ? '#3f7d5c' : '#e4d9cf';

          return (
            <li key={step.id} aria-current={isActive ? 'step' : undefined}>
              <div className="h-[3px] rounded-full" style={{ background: barColor }} />
              <div className="mt-2.5 flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                {isCompleted ? (
                  <CompleteIcon className="h-6 w-6 text-[#3f7d5c]" />
                ) : (
                  <span
                    className={`flex h-6 w-6 flex-none items-center justify-center rounded-full border text-[0.8rem] font-bold ${
                      isActive
                        ? 'border-[#a85f38] bg-[#a85f38] text-white'
                        : 'border-[#d8c8b9] text-[#6b5a4e]'
                    }`}
                  >
                    {step.icon}
                  </span>
                )}
                <span
                  className={`text-[0.9rem] leading-tight ${
                    isActive ? 'font-bold text-[#1f1610]' : 'font-medium text-[#6b5a4e]'
                  }`}
                >
                  {step.label}
                  {isCompleted && <span className="sr-only"> (done)</span>}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-[16px] border border-[#d8b9a4] border-l-[3px] border-l-[#b0673f] bg-[#fffaf5] px-5 py-4"
        >
          <h2 className="font-serif text-[1.2rem] font-medium text-[#1f1610]">We couldn&apos;t explain this letter</h2>
          <p className="mt-1.5 leading-relaxed text-[#55483d]">{error}</p>
        </div>
      )}

      {/* Upload step */}
      {currentStep === 'upload' && (
        <section className="ac-card" aria-labelledby="fema-upload-heading">
          <h2 id="fema-upload-heading" className="ac-h3">
            Paste your letter
          </h2>
          <p className="ac-muted leading-relaxed">
            Copy the full text of your FEMA letter or status update into the box below.
          </p>
          <form onSubmit={handleAnalyze} className="mt-6">
            <label htmlFor="letter" className="ac-label">
              Letter text
            </label>
            <textarea
              id="letter"
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              placeholder="Paste the full text of your FEMA letter or status update..."
              rows={12}
              className="ac-input resize-y leading-relaxed"
              required
            />
            <div className="mt-6">
              <button type="submit" disabled={!letterText.trim()} className="ac-btn">
                Explain my letter
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Analyzing step */}
      {currentStep === 'analyzing' && (
        <section className="ac-card" role="status" aria-live="polite">
          <div className="mb-4">
            <CompassStatus tone="progress" label="Working" />
          </div>
          <h2 className="ac-h3">Reading your letter</h2>
          <p className="ac-muted leading-relaxed">
            Aid Compass is finding your status, any deadlines, and what you need to do next.
          </p>
        </section>
      )}

      {/* Results step */}
      {currentStep === 'results' && analysis && (
        <div className="space-y-6">
          {/* Letter explanation, echoing the dark letter frame on the homepage */}
          <section className="ac-card ac-card-flush ac-band-dark" aria-labelledby="fema-result-heading">
            <div className="flex items-baseline justify-between gap-3 border-b border-[#4a3628] px-6 py-4">
              <h2 id="fema-result-heading" className="font-serif text-[1.25rem] font-medium text-white">
                Your letter, explained
              </h2>
            </div>
            <div className="space-y-5 p-6">
              <div>
                <p className="mb-1 text-[0.9rem] font-bold text-[#e6b595]">Status</p>
                <p className="font-serif text-[clamp(1.5rem,3.4vw,1.95rem)] font-medium leading-[1.15] tracking-[-0.01em] text-white">
                  {analysis.status}
                </p>
              </div>
              <div className="grid gap-1 rounded-[4px] border-l-[3px] border-[#e6b595] bg-[#2a1d14] px-4 py-3.5">
                <span className="text-[0.88rem] font-bold text-[#e6b595]">In plain words</span>
                <p className="text-[1.05rem] leading-relaxed text-[#f2ece5]">{analysis.meaning}</p>
              </div>

              {(analysis.amount || analysis.deadline) && (
                <div className="grid gap-3 md:grid-cols-2">
                  {analysis.amount && (
                    <div className="rounded-[12px] border border-[#4a3628] bg-[#33241a] p-4">
                      <p className="flex items-center gap-2 text-[0.9rem] font-bold text-[#e6b595]">
                        <AmountIcon />
                        Assistance amount
                      </p>
                      <p className="mt-1.5 font-serif text-[1.4rem] font-medium text-white">{analysis.amount}</p>
                    </div>
                  )}
                  {analysis.deadline && (
                    <div className="rounded-[12px] border border-[#4a3628] bg-[#33241a] p-4">
                      <p className="flex items-center gap-2 text-[0.9rem] font-bold text-[#e6b595]">
                        <ClockIcon />
                        Deadline
                      </p>
                      <p className="mt-1.5 leading-relaxed text-[#f2ece5]">{analysis.deadline}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Appeal information */}
          {analysis.appealInfo && (
            <section
              className="rounded-[16px] border border-[#e4d9cf] border-l-[3px] border-l-[#b0673f] bg-[#faf6f1] p-6"
              aria-labelledby="fema-appeal-heading"
            >
              <div className="mb-3">
                <CompassStatus tone="attention" label="Appeal rights" />
              </div>
              <h3 id="fema-appeal-heading" className="ac-h3">
                How to appeal
              </h3>
              <p className="leading-relaxed text-[#55483d]">{analysis.appealInfo}</p>
            </section>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleStartWalkthrough} className="ac-btn">
              Walk through next steps
            </button>
            <button type="button" onClick={handleReset} className="ac-btn-ghost">
              Explain another letter
            </button>
          </div>
        </div>
      )}

      {/* Walkthrough step */}
      {currentStep === 'walkthrough' && analysis && (
        <section className="ac-card" aria-labelledby="fema-plan-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="fema-plan-heading" className="ac-h3">
              Your action plan
            </h2>
            <p className="ac-note">
              {walkthroughStep < analysis.nextSteps.length
                ? `Step ${walkthroughStep + 1} of ${analysis.nextSteps.length}`
                : `All ${analysis.nextSteps.length} steps done`}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8 mt-4 h-1.5 w-full rounded-full bg-[#e4d9cf]">
            <div
              className={`h-1.5 rounded-full ${
                walkthroughStep >= analysis.nextSteps.length ? 'bg-[#3f7d5c]' : 'bg-[#b0673f]'
              }`}
              style={{ width: `${Math.min(100, ((walkthroughStep + 1) / analysis.nextSteps.length) * 100)}%` }}
            />
          </div>

          {/* Current step */}
          {walkthroughStep < analysis.nextSteps.length ? (
            <div>
              <p className="ac-kicker">Step {walkthroughStep + 1}</p>
              <p className="font-serif text-[clamp(1.3rem,2.8vw,1.6rem)] font-medium leading-snug tracking-[-0.01em] text-[#1f1610]">
                {analysis.nextSteps[walkthroughStep]}
              </p>

              {/* Navigation */}
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handlePreviousWalkthrough}
                  disabled={walkthroughStep === 0}
                  className="ac-btn-ghost"
                >
                  Previous step
                </button>
                <button type="button" onClick={handleNextWalkthrough} className="ac-btn">
                  {walkthroughStep === analysis.nextSteps.length - 1 ? 'Complete' : 'Next step'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <CompleteIcon className="mb-4 h-10 w-10 text-[#3f7d5c]" />
              <h3 className="ac-h3">You&apos;re all set</h3>
              <p className="max-w-prose leading-relaxed text-[#55483d]">
                You&apos;ve gone through every step in your action plan. If anything changes with your case, come back and run the new letter through here.
              </p>
              <button type="button" onClick={handleReset} className="ac-btn mt-6">
                Explain another letter
              </button>
            </div>
          )}
        </section>
      )}

      {/* Reference */}
      <section className="ac-card ac-card-flush mt-12" aria-labelledby="fema-statuses-heading">
        <div className="ac-card-head">
          <h2 id="fema-statuses-heading" className="font-serif text-[1.2rem] font-medium text-[#1f1610]">
            Common FEMA statuses
          </h2>
        </div>
        <ul className="m-0 list-none p-0">
          {commonStatuses.map((s) => (
            <li
              key={s.name}
              className="flex flex-col gap-2 border-t border-[#eadfd4] px-5 py-3.5 first:border-t-0 sm:flex-row sm:items-center sm:gap-4"
            >
              <span className="sm:w-[230px] sm:flex-none">
                <CompassStatus tone={s.tone} label={s.name} />
              </span>
              <span className="text-[0.98rem] leading-relaxed text-[#55483d]">{s.meaning}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
