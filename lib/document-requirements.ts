// Document requirements for disaster aid programs
export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  category: 'identification' | 'proof_of_ownership' | 'financial' | 'damage' | 'insurance' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

<<<<<<< HEAD
=======
export interface AidProgram {
  id: string;
  name: string;
  agency: string;
  documentRequirements: string[]; // Document IDs
}

export interface UserSituation {
  county?: string;
  damageType?: 'home' | 'business' | 'both' | 'other';
  ownershipStatus?: 'owner' | 'renter' | 'both';
  hasInsurance?: boolean;
  incomeRange?: 'low' | 'medium' | 'high' | 'prefer_not_to_say';
  isFarmer?: boolean;
  hasAppliedToFEMA?: boolean;
  damageSeverity?: 'minor' | 'moderate' | 'severe' | 'destroyed';
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

>>>>>>> ebb19d9ee3c2b7539060e71f77b78533289048ff
// All document definitions
export const documentDefinitions: DocumentRequirement[] = [
  {
    id: 'gov-id',
    name: 'Government-Issued Photo ID',
    description: "Driver's license, state ID, passport, or military ID",
    category: 'identification',
    priority: 'critical',
  },
  {
    id: 'ssn-document',
    name: 'Social Security Number Documentation',
    description: 'Social Security card or tax document showing SSN',
    category: 'identification',
    priority: 'critical',
  },
  {
    id: 'proof-of-occupancy',
    name: 'Proof of Occupancy',
    description: 'Utility bill, lease agreement, or voter registration showing you lived at the damaged property',
    category: 'proof_of_ownership',
    priority: 'critical',
  },
  {
    id: 'proof-of-ownership',
    name: 'Proof of Property Ownership',
    description: 'Deed, property tax bill, or mortgage statement',
    category: 'proof_of_ownership',
    priority: 'critical',
  },
  {
    id: 'damage-photos',
    name: 'Damage Photos and Documentation',
    description: 'Photos and videos of damage to property and belongings',
    category: 'damage',
    priority: 'critical',
  },
  {
    id: 'insurance-info',
    name: 'Insurance Information',
    description: "Homeowners, renters, flood, or business insurance policy details",
    category: 'insurance',
    priority: 'critical',
  },
  {
    id: 'bank-account',
    name: 'Bank Account Information',
    description: 'Routing number and account number for direct deposit of assistance',
    category: 'financial',
    priority: 'high',
  },
  {
    id: 'tax-returns',
    name: 'Recent Tax Returns',
    description: 'Federal tax returns for the past 2-3 years',
    category: 'financial',
    priority: 'high',
  },
  {
    id: 'mortgage-info',
    name: 'Mortgage Information',
    description: 'Current mortgage statement showing lender, balance, and account number',
    category: 'financial',
    priority: 'medium',
  },
  {
    id: 'ein-document',
    name: 'EIN Documentation',
    description: 'Employer Identification Number for your business',
    category: 'identification',
    priority: 'critical',
  },
  {
    id: 'business-license',
    name: 'Business License or Registration',
    description: 'State or local business license, articles of incorporation, or other business registration documents',
    category: 'identification',
    priority: 'critical',
  },
  {
    id: 'financial-statements',
    name: 'Business Financial Statements',
    description: 'Profit and loss statements, balance sheets, and cash flow statements',
    category: 'financial',
    priority: 'high',
  },
  {
    id: 'payroll-records',
    name: 'Payroll Records',
    description: 'Documentation of payroll expenses and employee counts',
    category: 'financial',
    priority: 'medium',
  },
  {
    id: 'income-verification',
    name: 'Income Verification',
    description: 'Pay stubs, benefit statements, or other proof of income',
    category: 'financial',
    priority: 'high',
  },
  {
    id: 'farm-records',
    name: 'Farm Operation Records',
    description: 'Crop records, livestock inventory, equipment lists, and production history',
    category: 'other',
    priority: 'critical',
  },
];

// Function to get document details by ID
export function getDocumentById(id: string): DocumentRequirement | undefined {
  return documentDefinitions.find(doc => doc.id === id);
}

// Function to group documents by category
export function groupDocumentsByCategory(documentIds: string[]): Record<string, DocumentRequirement[]> {
  const grouped: Record<string, DocumentRequirement[]> = {
    identification: [],
    proof_of_ownership: [],
    financial: [],
    damage: [],
    insurance: [],
    other: [],
  };

  documentIds.forEach(docId => {
    const doc = getDocumentById(docId);
    if (doc) {
      grouped[doc.category].push(doc);
    }
  });

  return grouped;
}
