'use client';

import { useState, useEffect } from 'react';
import { AidProgram, ApplicationStatus } from '@/lib/aid-programs';
import { ClockIcon, CompleteIcon, GlobeIcon, MailIcon, PhoneIcon, PinIcon } from '@/components/feature-icons';
import { CompassStatus } from '@/components/compass-status';

interface DeadlineTrackerProps {
  programs: AidProgram[];
  applicationStatuses: Record<string, ApplicationStatus>;
  onStatusChange: (programId: string, status: ApplicationStatus) => void;
}

// Labels/tones for AidProgram['deadlineUrgency'] ('high' | 'medium' | 'low'),
// already computed per-program (lib/aid-programs.ts's hardcoded entries, and
// lib/sheets/aid-programs-adapter.ts's estimateUrgency() for sheet-sourced
// ones). Kept in sync in wording with the urgency badge the aid-dashboard
// feature shows on program cards, so "Due soon"/"Upcoming"/"Ongoing" mean the
// same thing everywhere in the app.
const URGENCY_LABEL: Record<AidProgram['deadlineUrgency'], string> = {
  high: 'Due soon',
  medium: 'Upcoming',
  low: 'Ongoing',
};

const URGENCY_TONE: Record<AidProgram['deadlineUrgency'], 'attention' | 'progress' | 'neutral'> = {
  high: 'attention',
  medium: 'progress',
  low: 'neutral',
};

/**
 * Best-effort real-date extraction from a deadline string, matching only
 * ISO (YYYY-MM-DD) and US slash (MM/DD/YYYY) dates. Most sheet-sourced
 * deadlines are free text ("Ongoing", "Varies by program", "Not specified")
 * and intentionally fall through to null so they sort after real dates
 * instead of being parsed as nonsense.
 */
function parseDeadlineDate(deadlineText: string): Date | null {
  const isoMatch = deadlineText.match(/(\d{4})-(\d{2})-(\d{2})/);
  const slashMatch = deadlineText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const date = isoMatch
    ? new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`)
    : slashMatch
      ? new Date(`${slashMatch[3]}-${slashMatch[1]}-${slashMatch[2]}`)
      : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function formatDeadlineDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DeadlineTracker({ programs, applicationStatuses, onStatusChange }: DeadlineTrackerProps) {
  const [pinnedPrograms, setPinnedPrograms] = useState<string[]>([]);
  const [pinnedSnapshots, setPinnedSnapshots] = useState<AidProgram[]>([]);
  const [completedPlanSteps, setCompletedPlanSteps] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};

    const savedSteps = localStorage.getItem('deadlinePlanSteps');
    return savedSteps ? JSON.parse(savedSteps) : {};
  });

  useEffect(() => {
    const loadPinnedPrograms = async () => {
      const res = await fetch('/api/pinned-programs');
      if (res.ok) {
        const data = await res.json();
        setPinnedPrograms(data.programIds || []);
        setPinnedSnapshots(data.programs || []);
      }
    };
    loadPinnedPrograms();
  }, []);

  // Prefer live program data when the program is in the current matches, but
  // fall back to the saved snapshot so pins show up without a questionnaire
  // (or after the program drops out of the top matches).
  const filteredPrograms = pinnedPrograms
    .map(id => programs.find(p => p.id === id) ?? pinnedSnapshots.find(p => p.id === id))
    .filter((program): program is AidProgram => Boolean(program));

  // Real, parseable deadlines sort chronologically first; everything else
  // ("Ongoing", "Not specified", "Varies by program", ...) is pushed to the
  // end in its existing relative order (Array#sort is a stable sort).
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    const dateA = parseDeadlineDate(a.deadline);
    const dateB = parseDeadlineDate(b.deadline);
    if (dateA && dateB) return dateA.getTime() - dateB.getTime();
    if (dateA && !dateB) return -1;
    if (!dateA && dateB) return 1;
    return 0;
  });

  const summaryLine = (() => {
    if (sortedPrograms.length === 0) return null;
    const count = sortedPrograms.length;
    const countLabel = `${count} program${count === 1 ? '' : 's'} tracked`;
    const soonestDate = parseDeadlineDate(sortedPrograms[0].deadline);
    return soonestDate ? `${countLabel}, next deadline ${formatDeadlineDate(soonestDate)}` : countLabel;
  })();

  const unpinProgram = async (programId: string) => {
    const previousPinned = pinnedPrograms;
    const previousSnapshots = pinnedSnapshots;
    const newPinned = pinnedPrograms.filter(id => id !== programId);
    const newSnapshots = pinnedSnapshots.filter(p => p.id !== programId);

    setPinnedPrograms(newPinned);
    setPinnedSnapshots(newSnapshots);

    try {
      const res = await fetch('/api/pinned-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programIds: newPinned, programs: newSnapshots }),
      });
      if (!res.ok) {
        setPinnedPrograms(previousPinned);
        setPinnedSnapshots(previousSnapshots);
      }
    } catch (error) {
      console.error('Error unpinning program:', error);
      setPinnedPrograms(previousPinned);
      setPinnedSnapshots(previousSnapshots);
    }
  };

  const completedStepsFor = (programId: string) => {
    const status = applicationStatuses[programId] || 'not_applied';
    const statusProgress = status === 'received' || status === 'approved' ? 3 : status === 'applied' ? 2 : 0;

    return Math.max(completedPlanSteps[programId] || 0, statusProgress);
  };

  const advancePlan = (programId: string) => {
    const nextStep = Math.min(completedStepsFor(programId) + 1, 3);
    const updated = { ...completedPlanSteps, [programId]: nextStep };
    setCompletedPlanSteps(updated);
    localStorage.setItem('deadlinePlanSteps', JSON.stringify(updated));

    if (nextStep === 2) {
      onStatusChange(programId, 'applied');
    }
    if (nextStep === 3) {
      onStatusChange(programId, 'approved');
    }
  };

  const retreatPlan = (programId: string) => {
    // "Record funds received" isn't tracked in completedPlanSteps (it's
    // capped at 3), so undoing it just steps the status back down.
    if (applicationStatuses[programId] === 'received') {
      onStatusChange(programId, 'approved');
      return;
    }

    const current = completedStepsFor(programId);
    if (current === 0) return;

    const prevStep = current - 1;
    const updated = { ...completedPlanSteps, [programId]: prevStep };
    setCompletedPlanSteps(updated);
    localStorage.setItem('deadlinePlanSteps', JSON.stringify(updated));

    // Undo the status flip that reaching `current` originally caused, so
    // the max() in completedStepsFor doesn't immediately clamp back up.
    if (current === 2) {
      onStatusChange(programId, 'not_applied');
    } else if (current === 3) {
      onStatusChange(programId, 'applied');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
          Deadline Tracker
        </p>
        <h1 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
          Track Your Application Deadlines
        </h1>
        <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] max-w-2xl mx-auto">
          Turn your Aid Center matches into a focused sequence of deadlines and next actions.
        </p>
      </div>

      {sortedPrograms.length > 0 ? (
        <section aria-labelledby="recovery-plan-heading" className="ac-reveal-3 rounded-[14px] border border-[#e4d9cf] bg-[#faf6f1] p-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
                Your recovery plan
              </p>
              <h2 id="recovery-plan-heading" className="font-serif text-[1.35rem] font-medium text-[#1f1610]">
                Work through each application, one step at a time
              </h2>
              {summaryLine && <p className="mt-1 text-sm text-[#895031]">{summaryLine}</p>}
            </div>
            <p className="text-sm text-[#6b5a4e]">Complete the next open step to keep your plan moving.</p>
          </div>

          <div className="space-y-6">
            {sortedPrograms.map((program) => {
              const completedSteps = completedStepsFor(program.id);
              const steps = [
                { title: 'Prepare', detail: 'Gather required documents' },
                { title: 'Apply', detail: 'Submit your application' },
                { title: 'Follow up', detail: 'Record the decision' },
              ];
              const actionLabels = ['Mark documents ready', 'Mark application submitted', 'Mark decision received'];

              return (
                <figure key={program.id} className="rounded-[10px] border border-[#e4d9cf] bg-white p-4">
                  <figcaption className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      <span className="flex items-center gap-2">
                        <span className="font-medium text-[#1f1610]">{program.name}</span>
                        <CompassStatus tone={URGENCY_TONE[program.deadlineUrgency]} label={URGENCY_LABEL[program.deadlineUrgency]} />
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-sm text-[#6b5a4e]">
                        <ClockIcon className="text-[#b0673f]" /> Due: {program.deadline}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-sm text-[#6b5a4e]">{completedSteps} of 3 steps complete</span>
                      <button
                        type="button"
                        onClick={() => unpinProgram(program.id)}
                        aria-label={`Unpin ${program.name}`}
                        className="inline-flex flex-none items-center gap-1.5 rounded-lg border border-[#e4d9cf] px-2.5 py-1.5 text-sm font-medium text-[#895031] transition-colors hover:bg-[#f2ece5] hover:text-[#6b5a4e]"
                      >
                        <PinIcon className="w-3.5 h-3.5" /> Unpin
                      </button>
                    </span>
                  </figcaption>

                  {program.contactInfo && (
                    <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 border-b border-[#eee5dd] pb-4 text-sm text-[#6b5a4e]">
                      {program.contactInfo.phone && (
                        <a href={`tel:${program.contactInfo.phone}`} className="inline-flex items-center gap-1.5 hover:text-[#895031]">
                          <PhoneIcon className="text-[#b0673f]" /> {program.contactInfo.phone}
                        </a>
                      )}
                      {program.contactInfo.email && (
                        <a href={`mailto:${program.contactInfo.email}`} className="inline-flex items-center gap-1.5 hover:text-[#895031]">
                          <MailIcon className="text-[#b0673f]" /> Email
                        </a>
                      )}
                      {program.contactInfo.website && (
                        <a href={program.contactInfo.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-[#895031]">
                          <GlobeIcon className="text-[#b0673f]" /> Website
                        </a>
                      )}
                    </div>
                  )}

                  <ol className="grid gap-3 sm:grid-cols-3" aria-label={`${program.name} application timeline`}>
                    {steps.map((step, index) => {
                      const stepNumber = index + 1;
                      const isComplete = stepNumber <= completedSteps;
                      const isCurrent = stepNumber === completedSteps + 1;

                      return (
                        <li key={step.title} className="relative flex items-start gap-3 sm:block">
                          {index < steps.length - 1 && (
                            <span aria-hidden="true" className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-px sm:left-8 sm:top-[15px] sm:h-px sm:w-[calc(100%-16px)] ${isComplete ? 'bg-[#895031]' : 'bg-[#e4d9cf]'}`} />
                          )}
                          <span className={`relative z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full border text-sm font-semibold ${isComplete ? 'border-[#895031] bg-[#895031] text-white' : isCurrent ? 'border-[#895031] bg-[#f8e8dc] text-[#895031]' : 'border-[#e4d9cf] bg-white text-[#6b5a4e]'}`}>
                            {isComplete ? '✓' : stepNumber}
                          </span>
                          <span className="pt-1 sm:block sm:pt-2">
                            <span className="block text-sm font-semibold text-[#1f1610]">{step.title}</span>
                            <span className="block text-sm text-[#6b5a4e]">{step.detail}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>

                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    {completedSteps < steps.length ? (
                      <button
                        type="button"
                        onClick={() => advancePlan(program.id)}
                        className="rounded-lg bg-[#3d2b20] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2b1e15]"
                      >
                        {actionLabels[completedSteps]}
                      </button>
                    ) : applicationStatuses[program.id] === 'approved' ? (
                      <button
                        type="button"
                        onClick={() => onStatusChange(program.id, 'received')}
                        className="rounded-lg border border-[#895031] px-3.5 py-2 text-sm font-semibold text-[#895031] transition-colors hover:bg-[#f8e8dc]"
                      >
                        Record funds received
                      </button>
                    ) : (
                      <p className="flex items-center gap-1.5 text-sm font-medium text-[#168260]">
                        <CompleteIcon /> Plan complete
                      </p>
                    )}

                    {(completedSteps > 0 || applicationStatuses[program.id] === 'received') && (
                      <button
                        type="button"
                        onClick={() => retreatPlan(program.id)}
                        className="text-sm font-medium text-[#895031] hover:text-[#6b5a4e]"
                      >
                        Undo, I clicked the wrong step
                      </button>
                    )}
                  </div>
                </figure>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="rounded-[14px] border border-[#e4d9cf] bg-[#faf6f1] p-6 text-center">
          <h2 className="font-serif text-[1.35rem] font-medium text-[#1f1610]">Your recovery plan will appear here</h2>
          <p className="mt-2 text-[#6b5a4e]">Pin programs from the Programs tab to create a focused deadline tracker.</p>
        </section>
      )}
    </div>
  );
}
