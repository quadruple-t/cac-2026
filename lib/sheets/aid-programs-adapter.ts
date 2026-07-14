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

// AidDashboard now renders required documents via groupDocumentsByCategory
// (lib/document-requirements.ts), which only recognizes this fixed catalog of
// IDs — a program's raw sheet text (e.g. "Proof of income, citizenship
// documentation") gets silently dropped entirely if it isn't mapped to one of
// these first. Best-effort keyword matching, not a full catalog by design:
// the sheet's free text won't cleanly cover every ID, but partial coverage
// beats an empty "Required Documents" section.
const DOCUMENT_ID_KEYWORDS: [string, string[]][] = [
  ['gov-id', ["driver's license", 'driver license', 'photo id', 'state id', 'passport', 'military id']],
  ['ssn-document', ['social security', 'ssn']],
  ['proof-of-occupancy', ['utility bill', 'lease agreement', 'lease', 'voter registration', 'occupancy']],
  ['proof-of-ownership', ['deed', 'property tax', 'mortgage statement', 'ownership']],
  ['damage-photos', ['photo', 'video', 'damage document']],
  ['insurance-info', ['insurance']],
  ['bank-account', ['bank account', 'routing number', 'direct deposit']],
  ['tax-returns', ['tax return']],
  ['mortgage-info', ['mortgage']],
  ['ein-document', ['ein', 'employer identification']],
  ['business-license', ['business license', 'articles of incorporation', 'business registration']],
  ['financial-statements', ['financial statement', 'profit and loss', 'balance sheet', 'cash flow']],
  ['payroll-records', ['payroll']],
  ['income-verification', ['pay stub', 'income verification', 'proof of income', 'benefit statement']],
  ['farm-records', ['crop record', 'livestock inventory', 'farm operation', 'production history']],
];

function mapToDocumentIds(text: string): string[] {
  const lower = text.toLowerCase();
  return DOCUMENT_ID_KEYWORDS.filter(([, keywords]) => keywords.some(keyword => lower.includes(keyword)))
    .map(([id]) => id);
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
    requiredDocuments: mapToDocumentIds(program.requiredDocuments),
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
