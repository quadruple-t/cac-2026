// Document requirements for different disaster aid programs
export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  requiredFor: string[]; // Program IDs that require this document
  category: 'identification' | 'proof_of_ownership' | 'financial' | 'damage' | 'insurance' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  tips?: string[];
}

export interface AidProgram {
  id: string;
  name: string;
  agency: string;
  documentRequirements: string[]; // Document IDs
}

export interface UserSituation {
  county: string;
  damageType: 'home' | 'business' | 'both' | 'other';
  ownershipStatus: 'owner' | 'renter' | 'both';
  hasInsurance: boolean;
  incomeRange: 'low' | 'medium' | 'high' | 'prefer_not_to_say';
  isFarmer: boolean;
  hasAppliedToFEMA: boolean;
  damageSeverity: 'minor' | 'moderate' | 'severe' | 'destroyed';
}

// Aid programs database
export const aidPrograms: AidProgram[] = [
  {
    id: 'fema-ia',
    name: 'FEMA Individual Assistance',
    agency: 'FEMA',
    documentRequirements: [
      'gov-id',
      'ssn-document',
      'proof-of-occupancy',
      'damage-photos',
      'insurance-info',
      'bank-account',
    ],
  },
  {
    id: 'sba-home-loan',
    name: 'SBA Disaster Home Loan',
    agency: 'Small Business Administration',
    documentRequirements: [
      'gov-id',
      'ssn-document',
      'proof-of-ownership',
      'damage-photos',
      'insurance-info',
      'bank-account',
      'tax-returns',
      'mortgage-info',
    ],
  },
  {
    id: 'sba-business-loan',
    name: 'SBA Disaster Business Loan',
    agency: 'Small Business Administration',
    documentRequirements: [
      'gov-id',
      'ssn-document',
      'ein-document',
      'business-license',
      'damage-photos',
      'insurance-info',
      'bank-account',
      'tax-returns',
      'financial-statements',
      'payroll-records',
    ],
  },
  {
    id: 'nc-disaster-recovery',
    name: 'NC Disaster Recovery Program',
    agency: 'North Carolina Emergency Management',
    documentRequirements: [
      'gov-id',
      'proof-of-occupancy',
      'damage-photos',
      'insurance-info',
      'income-verification',
    ],
  },
  {
    id: 'usda-emergency-loan',
    name: 'USDA Emergency Farm Loan',
    agency: 'US Department of Agriculture',
    documentRequirements: [
      'gov-id',
      'ssn-document',
      'proof-of-ownership',
      'farm-records',
      'damage-photos',
      'insurance-info',
      'bank-account',
      'tax-returns',
    ],
  },
  {
    id: 'nc-211',
    name: 'NC 211 Local Resources',
    agency: 'United Way of North Carolina',
    documentRequirements: [
      'gov-id',
      'proof-of-occupancy',
      'income-verification',
    ],
  },
];

// All document definitions
export const documentDefinitions: DocumentRequirement[] = [
  {
    id: 'gov-id',
    name: 'Government-Issued Photo ID',
    description: "Driver's license, state ID, passport, or military ID",
    requiredFor: ['fema-ia', 'sba-home-loan', 'sba-business-loan', 'nc-disaster-recovery', 'usda-emergency-loan', 'nc-211'],
    category: 'identification',
    priority: 'critical',
    tips: [
      'Must be current and unexpired',
      "If you don't have one, contact your local DMV about replacement options",
    ],
  },
  {
    id: 'ssn-document',
    name: 'Social Security Number Documentation',
    description: 'Social Security card or tax document showing SSN',
    requiredFor: ['fema-ia', 'sba-home-loan', 'sba-business-loan', 'usda-emergency-loan'],
    category: 'identification',
    priority: 'critical',
    tips: [
      'Social Security card preferred',
      'W-2, 1099, or tax return also accepted',
    ],
  },
  {
    id: 'proof-of-occupancy',
    name: 'Proof of Occupancy',
    description: 'Utility bill, lease agreement, or voter registration showing you lived at the damaged property',
    requiredFor: ['fema-ia', 'nc-disaster-recovery', 'nc-211'],
    category: 'proof_of_ownership',
    priority: 'critical',
    tips: [
      'Documents must be from before the disaster',
      'Utility bills (electric, water, gas) are commonly accepted',
      'Mail with your name and address also works',
    ],
  },
  {
    id: 'proof-of-ownership',
    name: 'Proof of Property Ownership',
    description: 'Deed, property tax bill, or mortgage statement',
    requiredFor: ['sba-home-loan', 'usda-emergency-loan'],
    category: 'proof_of_ownership',
    priority: 'critical',
    tips: [
      'County property records can provide official documentation',
      'Contact your county register of deeds if you lost your deed',
    ],
  },
  {
    id: 'damage-photos',
    name: 'Damage Photos and Documentation',
    description: 'Photos and videos of damage to property and belongings',
    requiredFor: ['fema-ia', 'sba-home-loan', 'sba-business-loan', 'nc-disaster-recovery', 'usda-emergency-loan'],
    category: 'damage',
    priority: 'critical',
    tips: [
      'Take photos from multiple angles',
      'Include wide shots and close-ups',
      'Document water lines, structural damage, and destroyed items',
      'If safe, include before-and-after photos if available',
    ],
  },
  {
    id: 'insurance-info',
    name: 'Insurance Information',
    description: "Homeowners, renters, flood, or business insurance policy details",
    requiredFor: ['fema-ia', 'sba-home-loan', 'sba-business-loan', 'nc-disaster-recovery', 'usda-emergency-loan'],
    category: 'insurance',
    priority: 'critical',
    tips: [
      'Include policy number and contact info for your insurer',
      "If you don't have insurance, be prepared to explain why",
      'Keep copies of any claim denials or payouts',
    ],
  },
  {
    id: 'bank-account',
    name: 'Bank Account Information',
    description: 'Routing number and account number for direct deposit of assistance',
    requiredFor: ['fema-ia', 'sba-home-loan', 'sba-business-loan', 'usda-emergency-loan'],
    category: 'financial',
    priority: 'high',
    tips: [
      'A check or bank statement has this information',
      'Direct deposit speeds up assistance payments',
    ],
  },
  {
    id: 'tax-returns',
    name: 'Recent Tax Returns',
    description: 'Federal tax returns for the past 2-3 years',
    requiredFor: ['sba-home-loan', 'sba-business-loan', 'usda-emergency-loan'],
    category: 'financial',
    priority: 'high',
    tips: [
      'SBA typically requires 2 years of tax returns',
      "If you don't have them, request transcripts from the IRS",
    ],
  },
  {
    id: 'mortgage-info',
    name: 'Mortgage Information',
    description: 'Current mortgage statement showing lender, balance, and account number',
    requiredFor: ['sba-home-loan'],
    category: 'financial',
    priority: 'medium',
    tips: [
      'Your monthly mortgage statement has this information',
      'Contact your lender if you need a copy',
    ],
  },
  {
    id: 'ein-document',
    name: 'EIN Documentation',
    description: 'Employer Identification Number for your business',
    requiredFor: ['sba-business-loan'],
    category: 'identification',
    priority: 'critical',
    tips: [
      'Found on your EIN confirmation letter from the IRS',
      'Also on business tax returns and other official documents',
    ],
  },
  {
    id: 'business-license',
    name: 'Business License or Registration',
    description: 'State or local business license, articles of incorporation, or other business registration documents',
    requiredFor: ['sba-business-loan'],
    category: 'identification',
    priority: 'critical',
    tips: [
      "Contact your state Secretary of State if you need replacement documents",
      'Local business licenses may be available from your city or county',
    ],
  },
  {
    id: 'financial-statements',
    name: 'Business Financial Statements',
    description: 'Profit and loss statements, balance sheets, and cash flow statements',
    requiredFor: ['sba-business-loan'],
    category: 'financial',
    priority: 'high',
    tips: [
      'Include statements from before and after the disaster if possible',
      'Your accountant or bookkeeper can help prepare these',
    ],
  },
  {
    id: 'payroll-records',
    name: 'Payroll Records',
    description: 'Documentation of payroll expenses and employee counts',
    requiredFor: ['sba-business-loan'],
    category: 'financial',
    priority: 'medium',
    tips: [
      'Payroll reports from your payroll processor',
      'W-2s or 1099s for employees',
    ],
  },
  {
    id: 'income-verification',
    name: 'Income Verification',
    description: 'Pay stubs, benefit statements, or other proof of income',
    requiredFor: ['nc-disaster-recovery', 'nc-211'],
    category: 'financial',
    priority: 'high',
    tips: [
      'Recent pay stubs (last 3-6 months)',
      'Social Security, disability, or unemployment benefit statements',
      'Self-employed individuals can use tax returns or bank statements',
    ],
  },
  {
    id: 'farm-records',
    name: 'Farm Operation Records',
    description: 'Crop records, livestock inventory, equipment lists, and production history',
    requiredFor: ['usda-emergency-loan'],
    category: 'other',
    priority: 'critical',
    tips: [
      'Include FSA program records if applicable',
      'Document pre-disaster production levels',
      'Photos of damaged crops, equipment, and livestock are helpful',
    ],
  },
];

// Function to determine which programs a user qualifies for based on their situation
export function getEligiblePrograms(situation: UserSituation): AidProgram[] {
  const eligible: AidProgram[] = [];

  // FEMA Individual Assistance - available to most
  eligible.push(aidPrograms.find(p => p.id === 'fema-ia')!);

  // SBA Home Loan - for homeowners with property damage
  if (situation.ownershipStatus === 'owner' || situation.ownershipStatus === 'both') {
    if (situation.damageType === 'home' || situation.damageType === 'both') {
      eligible.push(aidPrograms.find(p => p.id === 'sba-home-loan')!);
    }
  }

  // SBA Business Loan - for business damage
  if (situation.damageType === 'business' || situation.damageType === 'both') {
    eligible.push(aidPrograms.find(p => p.id === 'sba-business-loan')!);
  }

  // NC Disaster Recovery - state program
  eligible.push(aidPrograms.find(p => p.id === 'nc-disaster-recovery')!);

  // USDA Emergency Loan - for farmers
  if (situation.isFarmer) {
    eligible.push(aidPrograms.find(p => p.id === 'usda-emergency-loan')!);
  }

  // NC 211 - local resources
  eligible.push(aidPrograms.find(p => p.id === 'nc-211')!);

  return eligible;
}

// Function to generate personalized document checklist
export function generateDocumentChecklist(situation: UserSituation): DocumentRequirement[] {
  const eligiblePrograms = getEligiblePrograms(situation);
  const requiredDocIds = new Set<string>();

  // Collect all required document IDs from eligible programs
  eligiblePrograms.forEach(program => {
    program.documentRequirements.forEach(docId => {
      requiredDocIds.add(docId);
    });
  });

  // Get document definitions for required IDs
  const checklist = documentDefinitions.filter(doc => requiredDocIds.has(doc.id));

  // Sort by priority (critical first, then high, medium, low)
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  checklist.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return checklist;
}

// Function to group documents by category
export function groupDocumentsByCategory(documents: DocumentRequirement[]): Record<string, DocumentRequirement[]> {
  const grouped: Record<string, DocumentRequirement[]> = {
    identification: [],
    proof_of_ownership: [],
    financial: [],
    damage: [],
    insurance: [],
    other: [],
  };

  documents.forEach(doc => {
    grouped[doc.category].push(doc);
  });

  return grouped;
}
