// Document requirements for disaster aid programs
export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  category: 'identification' | 'proof_of_ownership' | 'financial' | 'damage' | 'insurance' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

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
