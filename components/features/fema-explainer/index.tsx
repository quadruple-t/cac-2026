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

export default function FemaExplainer() {
  const [letterText, setLetterText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterText.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

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
      
      // Parse the JSON response
      const parsed = JSON.parse(responseText);
      setAnalysis(parsed);
    } catch (err) {
      console.error('AI analysis error:', err);
      setError('Failed to analyze the letter. Please try again or make sure you have pasted the full letter text.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
          FEMA Letter Explainer
        </p>
        <h2 className="font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
          Understand Your FEMA Letter
        </h2>
        <p className="text-[#6b5a4e] text-[1.05rem] max-w-2xl mx-auto">
          Paste your FEMA letter to understand what it means in plain English and what to do next.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-[#faf6f1] rounded-[14px] shadow-lg p-6 border border-[#e4d9cf]">
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

      {/* Error Section */}
      {error && (
        <div className="bg-[#fee2e2] border border-[#dc2626] rounded-[14px] p-6">
          <p className="text-[#dc2626] font-medium">{error}</p>
        </div>
      )}

      {/* Analysis Section */}
      {analysis && (
        <div className="space-y-4">
          <div className="bg-[#faf6f1] border border-[#e4d9cf] rounded-[14px] p-6">
            <h3 className="font-serif text-[1.15rem] font-medium text-[#1f1610] mb-4">
              Analysis Results
            </h3>
            
            {/* Status */}
            <div className="bg-white border border-[#e4d9cf] rounded-[14px] p-4 mb-4">
              <h4 className="font-semibold text-[#895031] mb-2">Status</h4>
              <p className="text-[#1f1610] font-medium text-lg">{analysis.status}</p>
            </div>
            
            {/* Amount */}
            {analysis.amount && (
              <div className="bg-white border border-[#e4d9cf] rounded-[14px] p-4 mb-4">
                <h4 className="font-semibold text-[#895031] mb-2">Assistance Amount</h4>
                <p className="text-[#1f1610] font-medium text-lg">{analysis.amount}</p>
              </div>
            )}
            
            {/* Deadline */}
            {analysis.deadline && (
              <div className="bg-white border border-[#e4d9cf] rounded-[14px] p-4 mb-4">
                <h4 className="font-semibold text-[#895031] mb-2">Important Deadline</h4>
                <p className="text-[#1f1610]">{analysis.deadline}</p>
              </div>
            )}
            
            {/* Meaning */}
            <div className="bg-white border border-[#e4d9cf] rounded-[14px] p-4 mb-4">
              <h4 className="font-semibold text-[#895031] mb-2">What This Means</h4>
              <p className="text-[#6b5a4e]">{analysis.meaning}</p>
            </div>
            
            {/* Next Steps */}
            <div className="bg-white border border-[#e4d9cf] rounded-[14px] p-4 mb-4">
              <h4 className="font-semibold text-[#895031] mb-2">Recommended Next Steps</h4>
              <ul className="text-[#6b5a4e] list-disc list-inside space-y-2">
                {analysis.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
            
            {/* Appeal Info */}
            {analysis.appealInfo && (
              <div className="bg-[#fffbeb] border border-[#f59e0b] rounded-[14px] p-4">
                <h4 className="font-semibold text-[#b0673f] mb-2">Appeal Information</h4>
                <p className="text-[#6b5a4e]">{analysis.appealInfo}</p>
              </div>
            )}
          </div>
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
