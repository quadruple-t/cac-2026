'use client';

import { useState } from 'react';
import { AidProgram, ApplicationStatus } from '@/lib/aid-programs';
import { CompassStatus } from '@/components/compass-status';
import { ClockIcon, CompleteIcon, PhoneIcon, MailIcon, GlobeIcon } from '@/components/feature-icons';

interface DeadlineTrackerProps {
  programs: AidProgram[];
  applicationStatuses: Record<string, ApplicationStatus>;
  onStatusChange: (programId: string, status: ApplicationStatus) => void;
}

export default function DeadlineTracker({ programs, applicationStatuses, onStatusChange }: DeadlineTrackerProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [completedPlanSteps, setCompletedPlanSteps] = useState<Record<string, number>>({});

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  const urgencyTones = {
    high: 'attention',
    medium: 'progress',
    low: 'success'
  } as const;

  const completedStepsFor = (programId: string) => {
    const status = applicationStatuses[programId] || 'not_applied';
    const statusProgress = status === 'received' || status === 'approved' ? 3 : status === 'applied' ? 2 : 0;

    return Math.max(completedPlanSteps[programId] || 0, statusProgress);
  };

  const advancePlan = (programId: string) => {
    const nextStep = Math.min(completedStepsFor(programId) + 1, 3);
    setCompletedPlanSteps((steps) => ({ ...steps, [programId]: nextStep }));

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
          Never miss a deadline. Track your application status and get reminders for your eligible programs.
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
                    <span className="font-medium text-[#1f1610]">{program.name}</span>
                    <span className="text-sm text-[#6b5a4e]">{completedSteps} of 3 steps complete</span>
                  </figcaption>

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

      {/* Deadline Cards */}
      <div className="ac-reveal-3 space-y-4">
        {programs.map((program) => (
          <div
            key={program.id}
            className="bg-[#faf6f1] rounded-[14px] p-6 border border-[#e4d9cf]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-serif text-[1.15rem] font-medium text-[#1f1610] mb-1">
                  {program.name}
                </h3>
                <p className="text-[#6b5a4e] text-[0.92rem]">{program.agency}</p>
              </div>
              <CompassStatus tone={urgencyTones[program.deadlineUrgency]} label={`${program.deadlineUrgency} priority`} />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="text-[#b0673f]" />
              <span className="text-sm text-[#6b5a4e]">{program.deadline}</span>
            </div>

            {/* Contact Information */}
            {program.contactInfo && (
              <div className="bg-white border border-[#e4d9cf] rounded-[10px] p-3 mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2">Contact Information</h4>
                <div className="space-y-1 text-sm">
                  {program.contactInfo.phone && (
                    <div className="flex items-center gap-2 text-[#6b5a4e]">
                      <PhoneIcon className="text-[#b0673f]" />
                      <a href={`tel:${program.contactInfo.phone}`} className="hover:text-[#b0673f] transition-colors">
                        {program.contactInfo.phone}
                      </a>
                    </div>
                  )}
                  {program.contactInfo.email && (
                    <div className="flex items-center gap-2 text-[#6b5a4e]">
                      <MailIcon className="text-[#b0673f]" />
                      <a href={`mailto:${program.contactInfo.email}`} className="hover:text-[#b0673f] transition-colors">
                        {program.contactInfo.email}
                      </a>
                    </div>
                  )}
                  {program.contactInfo.website && (
                    <div className="flex items-center gap-2 text-[#6b5a4e]">
                      <GlobeIcon className="text-[#b0673f]" />
                      <a
                        href={program.contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#b0673f] transition-colors"
                      >
                        {program.contactInfo.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <select
                className="flex-1 px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
                value={applicationStatuses[program.id] || 'not_applied'}
                onChange={(e) => onStatusChange(program.id, e.target.value as ApplicationStatus)}
              >
                <option value="not_applied">Not Applied</option>
                <option value="applied">Applied</option>
                <option value="approved">Approved</option>
                <option value="received">Received Funds</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Email Subscription */}
      <div className="bg-[#faf6f1] rounded-[14px] p-6 border border-[#e4d9cf]">
        <h3 className="font-serif text-[1.15rem] font-medium text-[#1f1610] mb-2">
          Get Deadline Reminders
        </h3>
        <p className="text-[#6b5a4e] text-[1.05rem] mb-4">
          We'll send you email reminders as your deadlines approach so you never miss an opportunity.
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
            Subscribed! We'll send reminders to {email}
          </div>
        )}
      </div>
    </div>
  );
}
