'use client';

import { useState } from 'react';
import { getGeminiModel } from '@/lib/firebase/ai';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  const steps = [
    { id: 'upload', label: 'Upload Letter', icon: '1' },
    { id: 'analyzing', label: 'Analyzing', icon: '2' },
    { id: 'results', label: 'Results', icon: '3' },
    { id: 'walkthrough', label: 'Next Steps', icon: '4' },
  ];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterText.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setCurrentStep('analyzing');

    try {
      console.log('Starting FEMA letter analysis...');
      const model = getGeminiModel();
      console.log('Gemini model obtained');
      
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

      console.log('Sending prompt to AI...');
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      console.log('AI response received:', responseText);
      
      const parsed = JSON.parse(responseText);
      console.log('Parsed analysis:', parsed);
      setAnalysis(parsed);
      setCurrentStep('results');
    } catch (err) {
      console.error('AI analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to analyze the letter: ${errorMessage}. Please try again or make sure you have pasted the full letter text.`);
      setCurrentStep('upload');
    } finally {
      setIsAnalyzing(false);
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
          FEMA Letter Explainer
        </p>
        <h1 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
          Understand Your FEMA Letter
        </h1>
        <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] max-w-2xl mx-auto">
          We'll help you understand your FEMA letter in plain English and guide you through what to do next.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="ac-reveal-3 flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = getStepIndex() > index;
          const isCurrent = step.id === currentStep;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                    isActive
                      ? 'bg-[#b0673f] text-white scale-110 shadow-lg'
                      : isCompleted
                      ? 'bg-[#10b981] text-white'
                      : 'bg-[#e4d9cf] text-[#6b5a4e]'
                  }`}
                >
                  {isCompleted ? '✓' : step.icon}
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
        <div className="ac-reveal-3 bg-[#faf6f1] rounded-[14px] shadow-lg p-8 border border-[#e4d9cf] animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              Upload Your FEMA Letter
            </h3>
            <p className="text-[#6b5a4e]">
              Paste the full text of your FEMA letter or status update below
            </p>
          </div>
          <form onSubmit={handleAnalyze}>
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
                className="bg-[#3d2b20] text-white px-8 py-4 rounded-[10px] font-semibold text-[1.1rem] hover:bg-[#2b1e15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Analyze My Letter →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Analyzing Step */}
      {currentStep === 'analyzing' && (
        <div className="ac-reveal-3 bg-[#faf6f1] rounded-[14px] shadow-lg p-12 border border-[#e4d9cf] text-center animate-in fade-in duration-500">
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
        <div className="ac-reveal space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Status Card */}
          <div className="bg-gradient-to-br from-[#b0673f] to-[#895031] rounded-[14px] shadow-lg p-8 text-white">
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
              className="bg-[#b0673f] text-white px-8 py-4 rounded-[10px] font-semibold text-[1.1rem] hover:bg-[#895031] transition-colors shadow-lg"
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
        <div className="ac-reveal space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#faf6f1] rounded-[14px] shadow-lg p-8 border border-[#e4d9cf]">
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
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#dc2626] flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h4 className="font-serif text-[1.5rem] font-medium text-[#1f1610] mb-4">
                  I'M NOT ALL SET
                </h4>
                <p className="text-[#6b5a4e] mb-8">
                  If the result is unknown or does not pass, you may need to take additional action or contact FEMA for clarification.
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
        <div className="bg-[#fee2e2] border-2 border-[#dc2626] rounded-[14px] p-6 animate-in fade-in">
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
