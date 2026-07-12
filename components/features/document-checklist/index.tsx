'use client';

import { useState } from 'react';
import { DocumentRequirement, groupDocumentsByCategory } from '@/lib/document-requirements';

interface DocumentChecklistProps {
  documents: DocumentRequirement[];
  onReset: () => void;
}

interface DocumentStatus {
  [key: string]: 'not_started' | 'in_progress' | 'completed';
}

const categoryLabels: Record<string, string> = {
  identification: 'Identification',
  proof_of_ownership: 'Proof of Ownership/Occupancy',
  financial: 'Financial Documents',
  damage: 'Damage Documentation',
  insurance: 'Insurance Information',
  other: 'Other Documents',
};

const priorityColors: Record<string, string> = {
  critical: 'bg-[#faf6f1] text-[#895031] border-[#b0673f]',
  high: 'bg-[#faf6f1] text-[#895031] border-[#b0673f]',
  medium: 'bg-[#faf6f1] text-[#6b5a4e] border-[#e4d9cf]',
  low: 'bg-[#faf6f1] text-[#6b5a4e] border-[#e4d9cf]',
};

export default function DocumentChecklist({ documents, onReset }: DocumentChecklistProps) {
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus>(
    documents.reduce((acc, doc) => ({ ...acc, [doc.id]: 'not_started' }), {})
  );

  const groupedDocuments = groupDocumentsByCategory(documents);

  const updateStatus = (docId: string, status: DocumentStatus[string]) => {
    setDocumentStatus(prev => ({ ...prev, [docId]: status }));
  };

  const completedCount = Object.values(documentStatus).filter(
    status => status === 'completed'
  ).length;
  const totalCount = documents.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-[#faf6f1] rounded-lg shadow-lg p-6 border border-[#e4d9cf]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1f1610] mb-2">
              Your Document Checklist
            </h2>
            <p className="text-[#55483d]">
              Based on your situation, you'll need {totalCount} documents for your aid applications.
            </p>
          </div>
          <button
            onClick={onReset}
            className="text-sm text-[#895031] hover:text-[#6b5a4e] font-medium"
          >
            Start Over
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-[#55483d] mb-2">
            <span>Progress</span>
            <span>{completedCount} of {totalCount} completed ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-[#e4d9cf] rounded-full h-3">
            <div
              className="bg-[#b0673f] h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Document Categories */}
      {Object.entries(groupedDocuments).map(([category, docs]) => {
        if (docs.length === 0) return null;

        return (
          <div key={category} className="bg-[#faf6f1] rounded-lg shadow-lg p-6 border border-[#e4d9cf]">
            <h3 className="text-lg font-semibold text-[#1f1610] mb-4 border-b border-[#e4d9cf] pb-2">
              {categoryLabels[category] || category}
            </h3>
            <div className="space-y-4">
              {docs.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  status={documentStatus[doc.id]}
                  onStatusChange={(status) => updateStatus(doc.id, status)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Completion Message */}
      {progressPercent === 100 && (
        <div className="bg-[#faf6f1] border border-[#b0673f] rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-[#1f1610] mb-2">
            🎉 You're All Set!
          </h3>
          <p className="text-[#55483d]">
            You've gathered all the documents you need. You're ready to apply for your aid programs.
          </p>
        </div>
      )}
    </div>
  );
}

interface DocumentCardProps {
  document: DocumentRequirement;
  status: DocumentStatus[string];
  onStatusChange: (status: DocumentStatus[string]) => void;
}

function DocumentCard({ document, status, onStatusChange }: DocumentCardProps) {
  return (
    <div className="border border-[#e4d9cf] rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-[#1f1610]">{document.name}</h4>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${priorityColors[document.priority]}`}
            >
              {document.priority}
            </span>
          </div>
          <p className="text-sm text-[#55483d]">{document.description}</p>
        </div>
      </div>

      {/* Tips */}
      {document.tips && document.tips.length > 0 && (
        <div className="bg-[#faf6f1] rounded-md p-3 mb-3 border border-[#e4d9cf]">
          <p className="text-xs font-medium text-[#895031] mb-1">💡 Tips:</p>
          <ul className="text-xs text-[#6b5a4e] space-y-1">
            {document.tips.map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Status Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onStatusChange('not_started')}
          className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
            status === 'not_started'
              ? 'bg-[#faf6f1] border-[#e4d9cf] text-[#2a201a]'
              : 'bg-white border-[#e4d9cf] text-[#6b5a4e] hover:bg-[#faf6f1]'
          }`}
        >
          Not Started
        </button>
        <button
          onClick={() => onStatusChange('in_progress')}
          className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
            status === 'in_progress'
              ? 'bg-[#faf6f1] border-[#b0673f] text-[#895031]'
              : 'bg-white border-[#e4d9cf] text-[#6b5a4e] hover:bg-[#faf6f1]'
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => onStatusChange('completed')}
          className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
            status === 'completed'
              ? 'bg-[#faf6f1] border-[#b0673f] text-[#895031]'
              : 'bg-white border-[#e4d9cf] text-[#6b5a4e] hover:bg-[#faf6f1]'
          }`}
        >
          Completed
        </button>
      </div>
    </div>
  );
}
