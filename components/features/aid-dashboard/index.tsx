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

export default function AidDashboard({ programs, applicationStatuses = {}, onStatusChange }: AidDashboardProps) {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, ApplicationStatus>>(applicationStatuses);
  const [pinnedPrograms, setPinnedPrograms] = useState<string[]>([]);
  // Saved copies of pinned programs, so the Deadline Tracker can show a pin
  // even when it isn't in the current top matches.
  const [pinnedSnapshots, setPinnedSnapshots] = useState<AidProgram[]>([]);

  useEffect(() => {
    const loadPinnedPrograms = async () => {
      try {
        const res = await fetch('/api/pinned-programs');
        if (res.ok) {
          const data = await res.json();
          setPinnedPrograms(data.programIds || []);
          setPinnedSnapshots(data.programs || []);
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
    
    const previousSnapshots = pinnedSnapshots;
    const newSnapshots = previousSnapshots.filter(p => newPinned.includes(p.id));
    const program = programs.find(p => p.id === programId);
    if (program && newPinned.includes(programId) && !newSnapshots.some(p => p.id === programId)) {
      newSnapshots.push(program);
    }

    setPinnedPrograms(newPinned);
    setPinnedSnapshots(newSnapshots);

    const revert = () => {
      setPinnedPrograms(pinnedPrograms);
      setPinnedSnapshots(previousSnapshots);
    };

    try {
      const res = await fetch('/api/pinned-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programIds: newPinned, programs: newSnapshots }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to save pinned programs:', res.status, errorData);
        revert();
      }
    } catch (error) {
      console.error('Error saving pinned programs:', error);
      revert();
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

  const statusTones = {
    not_applied: 'neutral',
    applied: 'progress',
    approved: 'success',
    received: 'success'
  } as const;

  const statusLabels = {
    not_applied: 'Not applied',
    applied: 'Applied',
    approved: 'Approved',
    received: 'Received funds'
  };

  // The page that renders this list owns the heading (county, count, and
  // ranking note), so this component is just the grid of program cards.
  return (
    <div>
      {programs.length > 0 && (
        <div className="grid items-start gap-5 md:grid-cols-2">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              isExpanded={expandedProgram === program.id}
              onToggle={() => toggleExpand(program.id)}
              status={localStatuses[program.id] || 'not_applied'}
              onStatusChange={(status) => handleStatusChange(program.id, status)}
              statusTone={statusTones[localStatuses[program.id] || 'not_applied']}
              statusLabel={statusLabels[localStatuses[program.id] || 'not_applied']}
              isPinned={pinnedPrograms.includes(program.id)}
              onPin={() => togglePin(program.id)}
            />
          ))}
        </div>
      )}

      {programs.length === 0 && (
        <div className="ac-card max-w-2xl">
          <h2 className="ac-h3">No programs matched yet</h2>
          <p className="ac-muted m-0">
            None of the programs we track matched your answers. Try changing your answers, or call NC 211 for
            personal help finding assistance.
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
  status: ApplicationStatus;
  onStatusChange: (status: ApplicationStatus) => void;
  statusTone: 'neutral' | 'progress' | 'success';
  statusLabel: string;
  isPinned: boolean;
  onPin: () => void;
}

function ProgramCard({ program, isExpanded, onToggle, status, onStatusChange, statusTone, statusLabel, isPinned, onPin }: ProgramCardProps) {
  const statusId = `status-${program.id}`;
  return (
    <article className="ac-card ac-card-flush">
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="ac-h3">
              {program.name}
            </h3>
            <p className="ac-muted m-0 text-[0.95rem]">{program.agency}</p>
          </div>
          <button
            type="button"
            onClick={onPin}
            className={`inline-flex min-h-[44px] flex-none items-center gap-1.5 rounded-[10px] border px-3 text-[0.92rem] font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#b0673f] ${
              isPinned
                ? 'border-[#3d2b20] bg-[#3d2b20] text-white hover:bg-[#241811]'
                : 'border-[#e4d9cf] bg-white text-[#1f1610] hover:border-[#c99a7d]'
            }`}
            aria-label={isPinned ? 'Unpin program' : 'Pin program'}
          >
            <PinIcon className="h-3.5 w-3.5" />
            {isPinned ? 'Pinned' : 'Pin'}
          </button>
        </div>

        <div className="mb-4">
          <CompassStatus tone={statusTone} label={statusLabel} />
        </div>

        <p className="mb-4 text-[1rem] leading-relaxed text-[#55483d]">
          {program.description}
        </p>

        {program.matchReason && (
          <a
            href={program.matchReason.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 block border-l-2 border-[#b0673f] pl-3 text-[0.92rem] leading-relaxed text-[#895031] underline decoration-[#d8b9a4] underline-offset-2 hover:text-[#3d2b20]"
          >
            {program.matchReason.sentence}
          </a>
        )}

        {/* Key details */}
        <ul className="mb-5 grid list-none gap-2 border-y border-[#eadfd4] py-3 pl-0 text-[0.95rem] text-[#55483d]">
          <li className="flex items-center gap-2.5">
            <AmountIcon className="text-[#895031]" />
            <span>{program.maxAmount}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <ClockIcon className="text-[#895031]" />
            <span>{program.deadline}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <DocumentIcon className="text-[#895031]" />
            <span>{program.requiredDocuments.length} documents required</span>
          </li>
        </ul>

        {/* Status tracker */}
        <div className="mb-4">
          <label htmlFor={statusId} className="ac-label">
            Application status
          </label>
          <select
            id={statusId}
            value={status}
            onChange={(e) => onStatusChange(e.target.value as ApplicationStatus)}
            className="ac-input"
          >
            <option value="not_applied">Not applied</option>
            <option value="applied">Applied</option>
            <option value="approved">Approved</option>
            <option value="received">Received funds</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          className="ac-btn-ghost w-full"
        >
          {isExpanded ? 'Hide documents' : 'See documents and apply'}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-[#e4d9cf] px-5 pb-6 pt-5 sm:px-6">
          <h4 className="mb-3 font-serif text-[1.15rem] font-medium text-[#1f1610]">
            Documents you&apos;ll need
          </h4>

          {(() => {
            const groupedDocs = groupDocumentsByCategory(program.requiredDocuments);
            const categoryLabels: Record<string, string> = {
              identification: 'Identification',
              proof_of_ownership: 'Proof of ownership or occupancy',
              financial: 'Financial documents',
              damage: 'Damage documentation',
              insurance: 'Insurance information',
              other: 'Other documents',
            };

            return Object.entries(groupedDocs).map(([category, docs]) => {
              if (docs.length === 0) return null;

              return (
                <div key={category} className="mb-5">
                  <h5 className="mb-2 text-[0.95rem] font-bold text-[#1f1610]">
                    {categoryLabels[category] || category}
                  </h5>
                  <ul className="ac-points">
                    {docs.map(doc => (
                      <li key={doc.id}>
                        <p className="m-0 text-[0.98rem] font-semibold text-[#1f1610]">{doc.name}</p>
                        <p className="m-0 text-[0.92rem] text-[#6b5a4e]">{doc.description}</p>
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
            className="ac-btn mt-1 w-full"
          >
            Apply on the program&apos;s site
          </a>
        </div>
      )}
    </article>
  );
}
