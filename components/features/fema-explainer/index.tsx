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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Status: Under Review</h3>
            <p className="text-sm text-yellow-700">
              Your application is currently being processed. FEMA is reviewing your documentation and eligibility.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">What This Means</h3>
            <p className="text-sm text-blue-700">
              "Under Review" means FEMA has received your application and is evaluating it against their eligibility criteria. This is a normal part of the process and can take several weeks.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Recommended Next Steps</h3>
            <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
              <li>Keep copies of all submitted documents</li>
              <li>Monitor your email for additional requests</li>
              <li>Check your FEMA application status online</li>
              <li>Be prepared to provide additional documentation if requested</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">If Denied</h3>
            <p className="text-sm text-gray-700">
              If you receive a denial, you have 60 days to appeal. Contact FEMA's helpline at 1-800-621-3362 for guidance on the appeal process.
            </p>
          </div>
        </div>
      `);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          FEMA Letter Explainer
        </h2>
        <p className="text-gray-600">
          Paste your FEMA letter to understand what it means and what to do next
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <form onSubmit={handleAnalyze}>
          <label htmlFor="letter" className="block text-sm font-medium text-gray-700 mb-2">
            Paste your FEMA letter here
          </label>
          <textarea
            id="letter"
            value={letterText}
            onChange={(e) => setLetterText(e.target.value)}
            placeholder="Paste the full text of your FEMA letter or status update..."
            rows={10}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!letterText.trim() || isAnalyzing}
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Letter'}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Section */}
      {analysis && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Analysis Results
          </h3>
          <div dangerouslySetInnerHTML={{ __html: analysis }} />
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Common FEMA Status Codes
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-800">Under Review</h4>
            <p className="text-gray-600">Application is being processed</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Approved</h4>
            <p className="text-gray-600">Eligible for assistance</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Denied</h4>
            <p className="text-gray-600">Not eligible - can appeal within 60 days</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Additional Info Needed</h4>
            <p className="text-gray-600">FEMA requires more documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
