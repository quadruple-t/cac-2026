'use client';

import { useState } from 'react';
import { AidProgram, ApplicationStatus } from '@/lib/aid-programs';

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

  const urgencyColors = {
    high: 'bg-[#dc2626] text-white',
    medium: 'bg-[#f59e0b] text-white',
    low: 'bg-[#10b981] text-white'
  };

  const statusColors = {
    not_applied: 'bg-[#faf6f1] border-[#e4d9cf] text-[#2a201a]',
    applied: 'bg-[#faf6f1] border-[#b0673f] text-[#895031]',
    approved: 'bg-[#faf6f1] border-[#10b981] text-[#10b981]',
    received: 'bg-[#faf6f1] border-[#10b981] text-[#10b981]'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
          Deadline Tracker
        </p>
        <h2 className="font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
          Track Your Application Deadlines
        </h2>
        <p className="text-[#6b5a4e] text-[1.05rem] max-w-2xl mx-auto">
          Never miss a deadline. Track your application status and get reminders for your eligible programs.
        </p>
      </div>

      {/* Deadline Cards */}
      <div className="space-y-4">
        {programs.map((program) => (
          <div
            key={program.id}
            className="bg-[#faf6f1] rounded-[14px] shadow-lg p-6 border border-[#e4d9cf]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-serif text-[1.15rem] font-medium text-[#1f1610] mb-1">
                  {program.name}
                </h3>
                <p className="text-[#6b5a4e] text-[0.92rem]">{program.agency}</p>
              </div>
              <span
                className={`text-[0.7rem] px-2.5 py-1 rounded-full font-medium uppercase tracking-[0.04em] ${urgencyColors[program.deadlineUrgency]}`}
              >
                {program.deadlineUrgency} Priority
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#b0673f] mr-2">⏰</span>
              <span className="text-sm text-[#6b5a4e]">{program.deadline}</span>
            </div>

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
          <div className="text-[#10b981] font-medium text-[1.05rem]">
            ✓ Subscribed! We'll send reminders to {email}
          </div>
        )}
      </div>
    </div>
  );
}
