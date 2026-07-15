'use client';

import { useState, useEffect } from 'react';
import { AidProgram, ApplicationStatus } from '@/lib/aid-programs';
import { groupDocumentsByCategory } from '@/lib/document-requirements';
import { CompassStatus } from '@/components/compass-status';
import { AmountIcon, ClockIcon, DocumentIcon, PinIcon } from '@/components/feature-icons';

interface AidDashboardProps {
  programs: AidProgram[];
  userSituation?: {
    county?: string;
    damageType?: string;
    ownershipStatus?: string;
  };
  applicationStatuses?: Record<string, ApplicationStatus>;
  onStatusChange?: (programId: string, status: ApplicationStatus) => void;
}

export default function AidDashboard({ programs, userSituation, applicationStatuses = {}, onStatusChange }: AidDashboardProps) {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, ApplicationStatus>>(applicationStatuses);
  const [pinnedPrograms, setPinnedPrograms] = useState<string[]>([]);

  useEffect(() => {
    const loadPinnedPrograms = async () => {
      try {
        const res = await fetch('/api/pinned-programs');
        if (res.ok) {
          const data = await res.json();
          setPinnedPrograms(data.programIds || []);
        } else {
          const errorData = await res.json();
          console.error('Failed to load pinned programs:', res.status, errorData);
        }
      } catch (error) {
        console.error('Error loading pinned programs:', error);
      }
    };
    loadPinnedPrograms();
  }, []);

  const togglePin = async (programId: string) => {
    const newPinned = pinnedPrograms.includes(programId)
      ? pinnedPrograms.filter(id => id !== programId)
      : [...pinnedPrograms, programId];
    
    setPinnedPrograms(newPinned);
    
    try {
      const res = await fetch('/api/pinned-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programIds: newPinned }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to save pinned programs:', res.status, errorData);
        setPinnedPrograms(pinnedPrograms);
      }
    } catch (error) {
      console.error('Error saving pinned programs:', error);
      setPinnedPrograms(pinnedPrograms);
    }
  };

  const toggleExpand = (programId: string) => {
    setExpandedProgram(expandedProgram === programId ? null : programId);
  };

  const handleStatusChange = (programId: string, status: ApplicationStatus) => {
    setLocalStatuses(prev => ({ ...prev, [programId]: status }));
    if (onStatusChange) {
      onStatusChange(programId, status);
    }
  };

  const urgencyTones = {
    high: 'attention',
    medium: 'progress',
    low: 'success'
  } as const;

  const statusTones = {
    not_applied: 'neutral',
    applied: 'progress',
    approved: 'success',
    received: 'success'
  } as const;

  const statusLabels = {
    not_applied: 'Not Applied',
    applied: 'Applied',
    approved: 'Approved',
    received: 'Received Funds'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
          Your Personalized Aid Dashboard
        </p>
        <h2 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
          Programs You Qualify For
        </h2>
        <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] max-w-2xl mx-auto">
          Based on your situation in {userSituation?.county || 'your area'}, you&apos;re eligible for {programs.length} aid programs.
        </p>
        <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-[#d8b9a4] bg-[#fffaf5] px-3 py-1.5 text-xs font-semibold text-[#895031]">
          <span className="text-base leading-none">✦</span> Ranked by fit and urgency
        </div>
      </div>

      {/* Programs Grid */}
      <div className="ac-reveal-3 grid md:grid-cols-2 gap-6">
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            isExpanded={expandedProgram === program.id}
            onToggle={() => toggleExpand(program.id)}
            urgencyTone={urgencyTones[program.deadlineUrgency]}
            status={localStatuses[program.id] || 'not_applied'}
            onStatusChange={(status) => handleStatusChange(program.id, status)}
            statusTone={statusTones[localStatuses[program.id] || 'not_applied']}
            statusLabel={statusLabels[localStatuses[program.id] || 'not_applied']}
            isPinned={pinnedPrograms.includes(program.id)}
            onPin={() => togglePin(program.id)}
          />
        ))}
      </div>

      {programs.length === 0 && (
        <div className="bg-[#faf6f1] rounded-[14px] p-8 text-center border border-[#e4d9cf]">
          <p className="text-[#6b5a4e] text-[1.05rem]">
            No programs matched your specific situation. Try adjusting your criteria or contact NC 211 for personalized assistance.
          </p>
        </div>
      )}
    </div>
  );
}

interface ProgramCardProps {
  program: AidProgram;
  isExpanded: boolean;
  onToggle: () => void;
  urgencyTone: 'attention' | 'progress' | 'success';
  status: ApplicationStatus;
  onStatusChange: (status: ApplicationStatus) => void;
  statusTone: 'neutral' | 'progress' | 'success';
  statusLabel: string;
  isPinned: boolean;
  onPin: () => void;
}

function ProgramCard({ program, isExpanded, onToggle, urgencyTone, status, onStatusChange, statusTone, statusLabel, isPinned, onPin }: ProgramCardProps) {
  return (
    <div className="ac-lift bg-[#faf6f1] rounded-[18px] border border-[#e4d9cf] overflow-hidden">
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-serif text-[1.15rem] font-medium text-[#1f1610] mb-1">
              {program.name}
            </h3>
            <p className="text-[#6b5a4e] text-[0.92rem]">{program.agency}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={onPin}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isPinned 
                  ? 'bg-[#b0673f] text-white' 
                  : 'bg-[#f2ece5] text-[#6b5a4e] hover:bg-[#e4d9cf]'
              }`}
              aria-label={isPinned ? 'Unpin program' : 'Pin program'}
            >
              <PinIcon className="w-3.5 h-3.5" />
              {isPinned ? 'Pinned' : 'Pin'}
            </button>
            <CompassStatus tone={urgencyTone} label={`${program.deadlineUrgency} priority`} />
            <CompassStatus tone={statusTone} label={statusLabel} />
          </div>
        </div>

        <p className="text-[#6b5a4e] text-[1.05rem] leading-relaxed mb-4">
          {program.description}
        </p>

        {/* Key Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-[#6b5a4e]">
            <AmountIcon className="mr-2 text-[#b0673f]" />
            <span>{program.maxAmount}</span>
          </div>
          <div className="flex items-center text-sm text-[#6b5a4e]">
            <ClockIcon className="mr-2 text-[#b0673f]" />
            <span>{program.deadline}</span>
          </div>
          <div className="flex items-center text-sm text-[#6b5a4e]">
            <DocumentIcon className="mr-2 text-[#b0673f]" />
            <span>{program.requiredDocuments.length} documents required</span>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="mb-4">
          <label className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2">
            Application Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as ApplicationStatus)}
            className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          >
            <option value="not_applied">Not Applied</option>
            <option value="applied">Applied</option>
            <option value="approved">Approved</option>
            <option value="received">Received Funds</option>
          </select>
        </div>

        <button
          onClick={onToggle}
          className="w-full bg-[#b0673f] text-white py-3 px-6 rounded-[10px] font-semibold text-[1.05rem] hover:bg-[#895031] transition-colors"
        >
          {isExpanded ? 'Show Less' : 'View Details'}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-[#e4d9cf] pt-6">
          <h4 className="text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-3">
            Required Documents
          </h4>
          
          {(() => {
            const groupedDocs = groupDocumentsByCategory(program.requiredDocuments);
            const categoryLabels: Record<string, string> = {
              identification: 'Identification',
              proof_of_ownership: 'Proof of Ownership/Occupancy',
              financial: 'Financial Documents',
              damage: 'Damage Documentation',
              insurance: 'Insurance Information',
              other: 'Other Documents',
            };
            
            return Object.entries(groupedDocs).map(([category, docs]) => {
              if (docs.length === 0) return null;
              
              return (
                <div key={category} className="mb-4">
                  <h5 className="font-semibold text-[#1f1610] text-sm mb-2">
                    {categoryLabels[category] || category}
                  </h5>
                  <ul className="space-y-2">
                    {docs.map(doc => (
                      <li key={doc.id} className="flex items-start gap-2">
                        <span className="text-[#b0673f] mt-0.5 text-sm">•</span>
                        <div>
                          <p className="text-[#1f1610] text-[0.98rem] font-medium">{doc.name}</p>
                          <p className="text-[#6b5a4e] text-[0.9rem]">{doc.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            });
          })()}

          <a
            href={program.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-[#b0673f] text-white py-3 px-6 rounded-[10px] font-semibold text-[1.05rem] hover:bg-[#895031] transition-colors text-center"
          >
            Apply Now →
          </a>
        </div>
      )}
    </div>
  );
}
