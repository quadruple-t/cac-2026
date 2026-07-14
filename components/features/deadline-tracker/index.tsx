'use client';

import { useState } from 'react';
import { AidProgram, ApplicationStatus } from '@/lib/aid-programs';
import { ClockIcon, CompleteIcon, GlobeIcon, MailIcon, PhoneIcon } from '@/components/feature-icons';

interface DeadlineTrackerProps {
  programs: AidProgram[];
  applicationStatuses: Record<string, ApplicationStatus>;
  onStatusChange: (programId: string, status: ApplicationStatus) => void;
}

export default function DeadlineTracker({ programs, applicationStatuses, onStatusChange }: DeadlineTrackerProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [completedPlanSteps, setCompletedPlanSteps] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};

    try {
      return JSON.parse(localStorage.getItem('deadlinePlanSteps') || '{}') as Record<string, number>;
    } catch {
      return {};
    }
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  const completedStepsFor = (programId: string) => {
    const status = applicationStatuses[programId] || 'not_applied';
    const statusProgress = status === 'received' || status === 'approved' ? 3 : status === 'applied' ? 2 : 0;

    return Math.max(completedPlanSteps[programId] || 0, statusProgress);
  };

  const advancePlan = (programId: string) => {
    const nextStep = Math.min(completedStepsFor(programId) + 1, 3);
    setCompletedPlanSteps((steps) => {
      const updated = { ...steps, [programId]: nextStep };
      localStorage.setItem('deadlinePlanSteps', JSON.stringify(updated));
      return updated;
    });

    if (nextStep === 2) {
      onStatusChange(programId, 'applied');
    }
    if (nextStep === 3) {
      onStatusChange(programId, 'approved');
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

      {programs.length > 0 ? (
        <section aria-labelledby="recovery-plan-heading" className="ac-reveal-3 rounded-[14px] border border-[#e4d9cf] bg-[#faf6f1] p-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
                Your recovery plan
              </p>
              <h2 id="recovery-plan-heading" className="font-serif text-[1.35rem] font-medium text-[#1f1610]">
                Work through each application, one step at a time
              </h2>
            </div>
            <p className="text-sm text-[#6b5a4e]">Complete the next open step to keep your plan moving.</p>
          </div>

          <div className="space-y-6">
            {programs.map((program) => {
              const completedSteps = completedStepsFor(program.id);
              const steps = [
                { title: 'Prepare', detail: 'Gather required documents' },
                { title: 'Apply', detail: 'Submit your application' },
                { title: 'Follow up', detail: 'Record the decision' },
              ];
              const actionLabels = ['Mark documents ready', 'Mark application submitted', 'Mark decision received'];

              return (
                <figure key={program.id} className="rounded-[10px] border border-[#e4d9cf] bg-white p-4">
                  <figcaption className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      <span className="block font-medium text-[#1f1610]">{program.name}</span>
                      <span className="mt-1 flex items-center gap-1.5 text-sm text-[#6b5a4e]">
                        <ClockIcon className="text-[#b0673f]" /> Due: {program.deadline}
                      </span>
                    </span>
                    <span className="text-sm text-[#6b5a4e]">{completedSteps} of 3 steps complete</span>
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

                  {completedSteps < steps.length ? (
                    <button
                      type="button"
                      onClick={() => advancePlan(program.id)}
                      className="mt-5 rounded-lg bg-[#3d2b20] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2b1e15]"
                    >
                      {actionLabels[completedSteps]}
                    </button>
                  ) : applicationStatuses[program.id] === 'approved' ? (
                    <button
                      type="button"
                      onClick={() => onStatusChange(program.id, 'received')}
                      className="mt-5 rounded-lg border border-[#895031] px-3.5 py-2 text-sm font-semibold text-[#895031] transition-colors hover:bg-[#f8e8dc]"
                    >
                      Record funds received
                    </button>
                  ) : (
                    <p className="mt-5 flex items-center gap-1.5 text-sm font-medium text-[#168260]">
                      <CompleteIcon /> Plan complete
                    </p>
                  )}
                </figure>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="rounded-[14px] border border-[#e4d9cf] bg-[#faf6f1] p-6 text-center">
          <h2 className="font-serif text-[1.35rem] font-medium text-[#1f1610]">Your recovery plan will appear here</h2>
          <p className="mt-2 text-[#6b5a4e]">Complete the intake in the Aid Center to create a personalized plan and timeline.</p>
        </section>
      )}

      {/* Email Subscription */}
      <div className="bg-[#faf6f1] rounded-[14px] p-6 border border-[#e4d9cf]">
        <h3 className="font-serif text-[1.15rem] font-medium text-[#1f1610] mb-2">
          Get Deadline Reminders
        </h3>
        <p className="text-[#6b5a4e] text-[1.05rem] mb-4">
          We&apos;ll send you email reminders as your deadlines approach so you never miss an opportunity.
        </p>

        {!subscribed ? (
          <form onSubmit={handleSubscribe} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
            />
            <button
              type="submit"
              className="bg-[#b0673f] text-white px-6 py-3 rounded-[10px] font-semibold text-[1.05rem] hover:bg-[#895031] transition-colors"
            >
              Subscribe
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-1.5 text-[#10b981] font-medium text-[1.05rem]">
            <CompleteIcon />
            Subscribed! We&apos;ll send reminders to {email}
          </div>
        )}
      </div>
    </div>
  );
}
