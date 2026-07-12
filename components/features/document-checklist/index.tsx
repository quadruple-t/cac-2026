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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-[#faf6f1] rounded-[14px] shadow-lg p-6 border border-[#e4d9cf]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-2">
              Your Document Checklist
            </h2>
            <p className="text-[#6b5a4e] text-[1.05rem]">
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
        <div className="mb-2">
          <div className="flex justify-between text-sm text-[#6b5a4e] mb-2">
            <span className="font-medium">Progress</span>
            <span>{completedCount} of {totalCount} completed ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-[#e4d9cf] rounded-full h-2">
            <div
              className="bg-[#b0673f] h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Document Categories */}
      {Object.entries(groupedDocuments).map(([category, docs]) => {
        if (docs.length === 0) return null;

        return (
          <div key={category} className="bg-[#faf6f1] rounded-[14px] shadow-lg p-6 border border-[#e4d9cf]">
            <h3 className="font-serif text-[1.4rem] font-medium text-[#1f1610] mb-4 border-b border-[#e4d9cf] pb-3">
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
        <div className="bg-[#faf6f1] border-2 border-[#b0673f] rounded-[14px] p-6 text-center">
          <h3 className="font-serif text-[1.6rem] font-medium text-[#1f1610] mb-2">
            🎉 You're All Set!
          </h3>
          <p className="text-[#6b5a4e] text-[1.05rem]">
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
    <div className="border border-[#e4d9cf] rounded-[14px] p-5 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-serif text-[1.15rem] font-medium text-[#1f1610]">{document.name}</h4>
            <span
              className={`text-[0.8rem] px-2.5 py-1 rounded-full border font-medium uppercase tracking-[0.04em] ${priorityColors[document.priority]}`}
            >
              {document.priority}
            </span>
          </div>
          <p className="text-[#6b5a4e] text-[1.05rem]">{document.description}</p>
        </div>
      </div>

      {/* Tips */}
      {document.tips && document.tips.length > 0 && (
        <div className="bg-[#faf6f1] rounded-[10px] p-4 mb-4 border border-[#e4d9cf]">
          <p className="text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2">💡 Tips:</p>
          <ul className="text-[0.98rem] text-[#6b5a4e] space-y-1">
            {document.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-[#b0673f] mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onStatusChange('not_started')}
          className={`px-3 py-1.5 text-sm rounded-[8px] border transition-colors font-medium ${
            status === 'not_started'
              ? 'bg-[#faf6f1] border-[#e4d9cf] text-[#2a201a]'
              : 'bg-white border-[#e4d9cf] text-[#6b5a4e] hover:bg-[#faf6f1]'
          }`}
        >
          Not Started
        </button>
        <button
          onClick={() => onStatusChange('in_progress')}
          className={`px-3 py-1.5 text-sm rounded-[8px] border transition-colors font-medium ${
            status === 'in_progress'
              ? 'bg-[#faf6f1] border-[#b0673f] text-[#895031]'
              : 'bg-white border-[#e4d9cf] text-[#6b5a4e] hover:bg-[#faf6f1]'
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => onStatusChange('completed')}
          className={`px-3 py-1.5 text-sm rounded-[8px] border transition-colors font-medium ${
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
