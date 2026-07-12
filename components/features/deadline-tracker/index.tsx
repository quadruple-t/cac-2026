'use client';

import { useState } from 'react';
import { AidProgram, ApplicationStatus } from '@/lib/aid-programs';
import { CompassStatus } from '@/components/compass-status';
import { ClockIcon, CompleteIcon } from '@/components/feature-icons';

interface DeadlineTrackerProps {
  programs: AidProgram[];
  applicationStatuses: Record<string, ApplicationStatus>;
  onStatusChange: (programId: string, status: ApplicationStatus) => void;
}

export default function DeadlineTracker({ programs, applicationStatuses, onStatusChange }: DeadlineTrackerProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
                      <span>📞</span>
                      <a href={`tel:${program.contactInfo.phone}`} className="hover:text-[#b0673f] transition-colors">
                        {program.contactInfo.phone}
                      </a>
                    </div>
                  )}
                  {program.contactInfo.email && (
                    <div className="flex items-center gap-2 text-[#6b5a4e]">
                      <span>✉️</span>
                      <a href={`mailto:${program.contactInfo.email}`} className="hover:text-[#b0673f] transition-colors">
                        {program.contactInfo.email}
                      </a>
                    </div>
                  )}
                  {program.contactInfo.website && (
                    <div className="flex items-center gap-2 text-[#6b5a4e]">
                      <span>🌐</span>
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
