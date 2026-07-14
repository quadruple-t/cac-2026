import type { AidProgram } from '@/lib/aid-programs';

// The shape actually sent over the wire by /api/aid-programs: matchReason.sourceUrl
// is resolved server-side (aid-programs-sheet.ts is server-only and can't be
// imported here, since this adapter also runs in the client dashboard bundle).
export interface RankedAidProgramResponse {
  program: {
    name: string;
    agency: string;
    description: string;
    maxBenefit: string;
    applicationDeadline: string;
    requiredDocuments: string;
    applicationLink: string;
    infoUrl: string;
    sourceUrl: string;
    phone: string;
    email: string;
  };
  score: number;
  matchReason: {
    sentence: string;
    sourceUrl: string;
  };
}

/** Best-effort urgency from free-text deadline strings — most sheet programs are "ongoing/no deadline". */
function estimateUrgency(deadlineText: string): AidProgram['deadlineUrgency'] {
  const isoMatch = deadlineText.match(/(\d{4})-(\d{2})-(\d{2})/);
  const slashMatch = deadlineText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const date = isoMatch
    ? new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`)
    : slashMatch
      ? new Date(`${slashMatch[3]}-${slashMatch[1]}-${slashMatch[2]}`)
      : null;
  if (!date || Number.isNaN(date.getTime())) return 'low';

  const daysUntil = (date.getTime() - Date.now()) / 86_400_000;
  if (daysUntil < 0) return 'low';
  if (daysUntil <= 30) return 'high';
  if (daysUntil <= 90) return 'medium';
  return 'low';
}

function splitList(text: string): string[] {
  const parts = text.includes(';') ? text.split(';') : text.split(',');
  return parts.map(part => part.trim()).filter(Boolean);
}

/** Maps a ranked Google Sheet row onto the AidProgram shape so the existing dashboard UI can render it unchanged. */
export function rankedProgramToAidProgram({ program, matchReason }: RankedAidProgramResponse, index: number): AidProgram {
  return {
    id: program.sourceUrl || `${program.name}-${index}`,
    name: program.name,
    agency: program.agency,
    description: program.description,
    maxAmount: program.maxBenefit || 'Not specified',
    deadline: program.applicationDeadline || 'Not specified',
    deadlineUrgency: estimateUrgency(program.applicationDeadline),
    requiredDocuments: splitList(program.requiredDocuments),
    applicationUrl: program.applicationLink || program.infoUrl || program.sourceUrl,
    contactInfo: {
      phone: program.phone || undefined,
      email: program.email || undefined,
      website: program.infoUrl || undefined,
    },
    eligibility: {},
    matchReason,
  };
}
