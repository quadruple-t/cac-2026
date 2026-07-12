'use client';

import { useState } from 'react';
import { AidProgram, ApplicationStatus } from '@/lib/aid-programs';

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

  const toggleExpand = (programId: string) => {
    setExpandedProgram(expandedProgram === programId ? null : programId);
  };

  const handleStatusChange = (programId: string, status: ApplicationStatus) => {
    setLocalStatuses(prev => ({ ...prev, [programId]: status }));
    if (onStatusChange) {
      onStatusChange(programId, status);
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
        <p className="mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
          Your Personalized Aid Dashboard
        </p>
        <h2 className="font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
          Programs You Qualify For
        </h2>
        <p className="text-[#6b5a4e] text-[1.05rem] max-w-2xl mx-auto">
          Based on your situation in {userSituation?.county || 'your area'}, you're eligible for {programs.length} aid programs.
        </p>
      </div>

      {/* Programs Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            isExpanded={expandedProgram === program.id}
            onToggle={() => toggleExpand(program.id)}
            urgencyColor={urgencyColors[program.deadlineUrgency]}
            status={localStatuses[program.id] || 'not_applied'}
            onStatusChange={(status) => handleStatusChange(program.id, status)}
            statusColor={statusColors[localStatuses[program.id] || 'not_applied']}
            statusLabel={statusLabels[localStatuses[program.id] || 'not_applied']}
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
  urgencyColor: string;
  status: ApplicationStatus;
  onStatusChange: (status: ApplicationStatus) => void;
  statusColor: string;
  statusLabel: string;
}

function ProgramCard({ program, isExpanded, onToggle, urgencyColor, status, onStatusChange, statusColor, statusLabel }: ProgramCardProps) {
  return (
    <div className="bg-[#faf6f1] rounded-[14px] shadow-lg border border-[#e4d9cf] overflow-hidden">
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
            <span className={`text-[0.7rem] px-2.5 py-1 rounded-full font-medium uppercase tracking-[0.04em] ${urgencyColor}`}>
              {program.deadlineUrgency} Priority
            </span>
            <span className={`text-[0.7rem] px-2.5 py-1 rounded-full font-medium uppercase tracking-[0.04em] border ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        <p className="text-[#6b5a4e] text-[1.05rem] leading-relaxed mb-4">
          {program.description}
        </p>

        {/* Key Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-[#6b5a4e]">
            <span className="text-[#b0673f] mr-2">💰</span>
            <span>{program.maxAmount}</span>
          </div>
          <div className="flex items-center text-sm text-[#6b5a4e]">
            <span className="text-[#b0673f] mr-2">⏰</span>
            <span>{program.deadline}</span>
          </div>
          <div className="flex items-center text-sm text-[#6b5a4e]">
            <span className="text-[#b0673f] mr-2">📄</span>
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
          className="w-full bg-[#3d2b20] text-white py-3 px-6 rounded-[10px] font-semibold text-[1.05rem] hover:bg-[#2b1e15] transition-colors"
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
          <ul className="space-y-2 mb-6">
            {program.requiredDocuments.map((doc, index) => (
              <li key={index} className="flex items-start gap-2 text-[#6b5a4e] text-[0.98rem]">
                <span className="text-[#b0673f] mt-0.5">•</span>
                <span>{doc}</span>
              </li>
            ))}
          </ul>

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
