'use client';

import { useState } from 'react';

export default function FemaExplainer() {
  const [letterText, setLetterText] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterText.trim()) return;

    setIsAnalyzing(true);
    
    // Simulate API call - in production, this would call Claude API
    setTimeout(() => {
      setAnalysis(`
        <div className="space-y-4">
          <div className="bg-[#faf6f1] border border-[#e4d9cf] rounded-[14px] p-4">
            <h3 className="font-semibold text-[#895031] mb-2">Status: Under Review</h3>
            <p className="text-sm text-[#6b5a4e]">
              Your application is currently being processed. FEMA is reviewing your documentation and eligibility.
            </p>
          </div>
          
          <div className="bg-[#faf6f1] border border-[#e4d9cf] rounded-[14px] p-4">
            <h3 className="font-semibold text-[#895031] mb-2">What This Means</h3>
            <p className="text-sm text-[#6b5a4e]">
              "Under Review" means FEMA has received your application and is evaluating it against their eligibility criteria. This is a normal part of the process and can take several weeks.
            </p>
          </div>
          
          <div className="bg-[#faf6f1] border border-[#e4d9cf] rounded-[14px] p-4">
            <h3 className="font-semibold text-[#895031] mb-2">Recommended Next Steps</h3>
            <ul className="text-sm text-[#6b5a4e] list-disc list-inside space-y-1">
              <li>Keep copies of all submitted documents</li>
              <li>Monitor your email for additional requests</li>
              <li>Check your FEMA application status online</li>
              <li>Be prepared to provide additional documentation if requested</li>
            </ul>
          </div>
          
          <div className="bg-[#faf6f1] border border-[#e4d9cf] rounded-[14px] p-4">
            <h3 className="font-semibold text-[#895031] mb-2">If Denied</h3>
            <p className="text-sm text-[#6b5a4e]">
              If you receive a denial, you have 60 days to appeal. Contact FEMA's helpline at 1-800-621-3362 for guidance on the appeal process.
            </p>
          </div>
        </div>
      `);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
          FEMA Letter Explainer
        </p>
        <h1 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
          Understand Your FEMA Letter
        </h1>
        <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] max-w-2xl mx-auto">
          Paste your FEMA letter to understand what it means in plain English and what to do next.
        </p>
      </div>

      {/* Input Section */}
      <div className="ac-reveal-3 bg-[#faf6f1] rounded-[14px] p-6 border border-[#e4d9cf]">
        <form onSubmit={handleAnalyze}>
          <label htmlFor="letter" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
            Paste your FEMA letter here
          </label>
          <textarea
            id="letter"
            value={letterText}
            onChange={(e) => setLetterText(e.target.value)}
            placeholder="Paste the full text of your FEMA letter or status update..."
            rows={10}
            className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
            required
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!letterText.trim() || isAnalyzing}
              className="bg-[#3d2b20] text-white px-6 py-3 rounded-[10px] font-semibold text-[1.05rem] hover:bg-[#2b1e15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Letter'}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Section */}
      {analysis && (
        <div className="ac-reveal bg-[#faf6f1] rounded-[14px] p-6 border border-[#e4d9cf]">
          <h3 className="font-serif text-[1.15rem] font-medium text-[#1f1610] mb-4">
            Analysis Results
          </h3>
          <div dangerouslySetInnerHTML={{ __html: analysis }} />
        </div>
      )}

      {/* Info Section */}
      <div className="bg-[#faf6f1] rounded-[14px] p-6 border border-[#e4d9cf]">
        <h3 className="font-serif text-[1.15rem] font-medium text-[#1f1610] mb-4">
          Common FEMA Status Codes
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-[#1f1610] mb-1">Under Review</h4>
            <p className="text-[#6b5a4e]">Application is being processed</p>
          </div>
          <div>
            <h4 className="font-medium text-[#1f1610] mb-1">Approved</h4>
            <p className="text-[#6b5a4e]">Eligible for assistance</p>
          </div>
          <div>
            <h4 className="font-medium text-[#1f1610] mb-1">Denied</h4>
            <p className="text-[#6b5a4e]">Not eligible - can appeal within 60 days</p>
          </div>
          <div>
            <h4 className="font-medium text-[#1f1610] mb-1">Additional Info Needed</h4>
            <p className="text-[#6b5a4e]">FEMA requires more documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
