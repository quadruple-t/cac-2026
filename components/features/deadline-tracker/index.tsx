'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AidProgram, ApplicationStatus } from '@/lib/aid-programs';
import { CompassStatus } from '@/components/compass-status';
import { ClockIcon, CompleteIcon, GlobeIcon, MailIcon, PhoneIcon } from '@/components/feature-icons';

interface DeadlineTrackerProps {
  programs: AidProgram[];
  applicationStatuses: Record<string, ApplicationStatus>;
  onStatusChange: (programId: string, status: ApplicationStatus) => void;
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

  // The page header (h1) lives in app/deadlines/page.tsx; this renders the plan.
  return filteredPrograms.length > 0 ? (
    <section aria-labelledby="recovery-plan-heading">
      <div className="mb-6">
        <h2 id="recovery-plan-heading" className="ac-h2">
          Your recovery plan
        </h2>
        <p className="ac-muted m-0 max-w-[36rem] text-[1.02rem] leading-relaxed">
          Work through each application one step at a time. Finish the next open step to keep your plan moving.
        </p>
      </div>

      <ul className="m-0 grid list-none gap-5 p-0">
        {filteredPrograms.map((program) => {
          const completedSteps = completedStepsFor(program.id);
          const steps = [
            { title: 'Prepare', detail: 'Gather required documents' },
            { title: 'Apply', detail: 'Submit your application' },
            { title: 'Follow up', detail: 'Record the decision' },
          ];
          const actionLabels = ['Mark documents ready', 'Mark application submitted', 'Mark decision received'];
          const appStatus = applicationStatuses[program.id];
          const isDone = completedSteps >= steps.length;
          const urgency: { tone: 'success' | 'progress' | 'attention' | 'neutral'; label: string } =
            appStatus === 'received'
              ? { tone: 'success', label: 'Funds received' }
              : isDone
                ? { tone: 'success', label: 'Done' }
                : completedSteps < 2 && program.deadlineUrgency === 'high'
                  ? { tone: 'attention', label: 'Closing soon' }
                  : completedSteps > 0
                    ? { tone: 'progress', label: 'In progress' }
                    : { tone: 'neutral', label: 'Not started' };

          return (
            <li key={program.id}>
              <article className="ac-card" aria-labelledby={`plan-${program.id}-name`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="min-w-0">
                    <h3 id={`plan-${program.id}-name`} className="ac-h3">
                      {program.name}
                    </h3>
                    <p className="m-0 flex items-center gap-1.5 text-[0.95rem] text-[#55483d]">
                      <ClockIcon className="text-[#b0673f]" /> Due: {program.deadline}
                    </p>
                  </div>
                  <div className="flex flex-none flex-row items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                    <CompassStatus tone={urgency.tone} label={urgency.label} />
                    <span className="ac-note">{completedSteps} of 3 steps done</span>
                  </div>
                </div>

                {program.contactInfo && (
                  <div className="mt-4 flex flex-wrap gap-x-6 border-t border-[#eadfd4] pt-2 text-[0.95rem]">
                    {program.contactInfo.phone && (
                      <a
                        href={`tel:${program.contactInfo.phone}`}
                        className="inline-flex min-h-[44px] items-center gap-1.5 font-medium text-[#55483d] no-underline hover:text-[#895031]"
                      >
                        <PhoneIcon className="text-[#b0673f]" /> {program.contactInfo.phone}
                      </a>
                    )}
                    {program.contactInfo.email && (
                      <a
                        href={`mailto:${program.contactInfo.email}`}
                        className="inline-flex min-h-[44px] items-center gap-1.5 font-medium text-[#55483d] no-underline hover:text-[#895031]"
                      >
                        <MailIcon className="text-[#b0673f]" /> Email
                      </a>
                    )}
                    {program.contactInfo.website && (
                      <a
                        href={program.contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-1.5 font-medium text-[#55483d] no-underline hover:text-[#895031]"
                      >
                        <GlobeIcon className="text-[#b0673f]" /> Website
                      </a>
                    )}
                  </div>
                )}

                <ol
                  className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-3 sm:gap-3"
                  aria-label={`${program.name} application timeline`}
                >
                  {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isComplete = stepNumber <= completedSteps;
                    const isCurrent = stepNumber === completedSteps + 1;

                    return (
                      <li key={step.title} className="relative flex items-start gap-3 sm:block">
                        {index < steps.length - 1 && (
                          <span
                            aria-hidden="true"
                            className={`absolute left-[15px] top-8 h-[calc(100%-16px)] w-px sm:left-9 sm:top-[15px] sm:h-px sm:w-[calc(100%-28px)] ${isComplete ? 'bg-[#895031]' : 'bg-[#e4d9cf]'}`}
                          />
                        )}
                        <span
                          className={`relative z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full text-sm font-semibold ${
                            isComplete
                              ? 'border border-[#895031] bg-[#895031] text-white'
                              : isCurrent
                                ? 'border-2 border-[#b0673f] bg-[#faf6f1] text-[#895031]'
                                : 'border border-[#e4d9cf] bg-[#faf6f1] text-[#6b5a4e]'
                          }`}
                        >
                          {isComplete ? (
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <span aria-hidden="true">{stepNumber}</span>
                          )}
                        </span>
                        <span className="pt-1 sm:block sm:pt-3">
                          <span className="block font-semibold text-[#1f1610]">
                            {step.title}
                            <span className="sr-only">
                              {isComplete ? ' (done)' : isCurrent ? ' (next step)' : ''}
                            </span>
                          </span>
                          <span className="block text-[0.95rem] text-[#55483d]">{step.detail}</span>
                        </span>
                      </li>
                    );
                  })}
                </ol>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#eadfd4] pt-5">
                  {completedSteps < steps.length ? (
                    <button type="button" onClick={() => advancePlan(program.id)} className="ac-btn-dark ac-btn-sm min-h-[44px]">
                      {actionLabels[completedSteps]}
                    </button>
                  ) : applicationStatuses[program.id] === 'approved' ? (
                    <button
                      type="button"
                      onClick={() => onStatusChange(program.id, 'received')}
                      className="ac-btn-ghost ac-btn-sm min-h-[44px]"
                    >
                      Record funds received
                    </button>
                  ) : (
                    <p className="m-0 flex min-h-[44px] items-center gap-1.5 font-semibold text-[#3f7d5c]">
                      <CompleteIcon /> Plan complete
                    </p>
                  )}

                  {(completedSteps > 0 || applicationStatuses[program.id] === 'received') && (
                    <button
                      type="button"
                      onClick={() => retreatPlan(program.id)}
                      className="ac-link min-h-[44px] cursor-pointer bg-transparent px-1 text-[0.95rem] underline-offset-4 hover:underline"
                    >
                      Undo last step
                    </button>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  ) : (
    <section aria-labelledby="recovery-plan-heading" className="ac-card max-w-[46rem]">
      <h2 id="recovery-plan-heading" className="ac-h3">
        Your recovery plan will appear here
      </h2>
      <p className="ac-muted m-0 mb-5 leading-relaxed">
        Pin programs on My aid to turn them into a deadline plan with next steps.
      </p>
      <Link href="/dashboard" className="ac-btn">
        Go to My aid
      </Link>
    </section>
  );
}
