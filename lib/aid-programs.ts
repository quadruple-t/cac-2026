export interface AidProgram {
  id: string;
  name: string;
  agency: string;
  description: string;
  maxAmount: string;
  deadline: string;
  deadlineUrgency: 'high' | 'medium' | 'low';
  requiredDocuments: string[]; // Document IDs from document-requirements.ts
  applicationUrl: string;
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  eligibility: {
    counties?: string[];
    damageTypes?: ('home' | 'business' | 'both' | 'other')[];
    ownershipStatus?: ('owner' | 'renter' | 'both')[];
    incomeRanges?: ('low' | 'medium' | 'high' | 'prefer_not_to_say')[];
    isFarmer?: boolean;
    damageSeverities?: ('minor' | 'moderate' | 'severe' | 'destroyed')[];
    hasInsurance?: boolean;
    hasAppliedToFEMA?: boolean;
  };
}

export type ApplicationStatus = 'not_applied' | 'applied' | 'approved' | 'received';

export interface ProgramApplication {
  programId: string;
  status: ApplicationStatus;
  applicationDate?: string;
  notes?: string;
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

const aidPrograms: AidProgram[] = [
  {
    id: 'fema-ia',
    name: 'FEMA Individual Assistance',
    agency: 'Federal Emergency Management Agency',
    description: 'Financial assistance for disaster-related expenses not covered by insurance, including home repairs, temporary housing, and other needs.',
    maxAmount: 'Up to $41,000',
    deadline: '60 days after disaster declaration',
    deadlineUrgency: 'high',
    requiredDocuments: [
      'gov-id',
      'insurance-info',
      'damage-photos',
      'proof-of-occupancy',
      'bank-account',
    ],
    applicationUrl: 'https://www.disasterassistance.gov/',
    contactInfo: {
      phone: '1-800-621-3362',
      website: 'https://www.fema.gov/',
      email: 'fema-helpline@fema.dhs.gov'
    },
    eligibility: {
      damageTypes: ['home', 'both'],
      ownershipStatus: ['owner', 'renter'],
      incomeRanges: ['low', 'medium', 'high', 'prefer_not_to_say'],
      damageSeverities: ['minor', 'moderate', 'severe', 'destroyed']
    }
  },
  {
    id: 'sba-disaster-loan',
    name: 'SBA Disaster Loans',
    agency: 'Small Business Administration',
    description: 'Low-interest loans for homeowners, renters, and businesses to repair or replace disaster-damaged property.',
    maxAmount: 'Up to $2 million for businesses, $500k for homes',
    deadline: '90 days after disaster declaration',
    deadlineUrgency: 'high',
    requiredDocuments: [
      'gov-id',
      'ssn-document',
      'tax-returns',
      'financial-statements',
      'insurance-info',
      'damage-photos',
      'proof-of-ownership',
    ],
    applicationUrl: 'https://www.sba.gov/disaster',
    contactInfo: {
      phone: '1-800-659-2955',
      website: 'https://www.sba.gov/',
      email: 'disastercustomerservice@sba.gov'
    },
    eligibility: {
      damageTypes: ['home', 'business', 'both'],
      ownershipStatus: ['owner', 'renter'],
      incomeRanges: ['low', 'medium', 'high', 'prefer_not_to_say'],
      damageSeverities: ['minor', 'moderate', 'severe', 'destroyed']
    }
  },
  {
    id: 'usda-emergency-loan',
    name: 'USDA Emergency Farm Loans',
    agency: 'U.S. Department of Agriculture',
    description: 'Emergency loans for farmers to restore or replace essential property, livestock, or crops damaged by disaster.',
    maxAmount: 'Up to $500,000',
    deadline: 'Varies by program',
    deadlineUrgency: 'medium',
    requiredDocuments: [
      'gov-id',
      'ssn-document',
      'proof-of-ownership',
      'farm-records',
      'damage-photos',
      'insurance-info',
      'bank-account',
      'tax-returns',
    ],
    applicationUrl: 'https://www.fsa.usda.gov/services/disaster-assistance',
    contactInfo: {
      phone: '1-877-508-8362',
      website: 'https://www.fsa.usda.gov/',
      email: 'fsa.outreach@usda.gov'
    },
    eligibility: {
      damageTypes: ['home', 'business', 'both', 'other'],
      ownershipStatus: ['owner'],
      isFarmer: true,
      incomeRanges: ['low', 'medium', 'high', 'prefer_not_to_say'],
      damageSeverities: ['minor', 'moderate', 'severe', 'destroyed']
    }
  },
  {
    id: 'nc-disaster-recovery',
    name: 'NC Disaster Recovery Programs',
    agency: 'North Carolina Emergency Management',
    description: 'State-level assistance programs for North Carolina residents affected by disasters, including housing assistance and recovery grants.',
    maxAmount: 'Varies by program',
    deadline: 'Varies by program',
    deadlineUrgency: 'medium',
    requiredDocuments: [
      'gov-id',
      'damage-photos',
      'insurance-info',
      'income-verification',
      'proof-of-ownership',
    ],
    applicationUrl: 'https://www.ncdps.gov/emergency-management',
    contactInfo: {
      phone: '1-888-835-5806',
      website: 'https://www.ncdps.gov/',
      email: 'ncem@ncdps.gov'
    },
    eligibility: {
      counties: ['Buncombe', 'Haywood', 'Madison', 'Yancey', 'Mitchell', 'Avery', 'McDowell', 'Rutherford', 'Polk', 'Henderson', 'Transylvania', 'Jackson', 'Swain', 'Macon', 'Cherokee', 'Clay', 'Graham'],
      damageTypes: ['home', 'business', 'both'],
      ownershipStatus: ['owner', 'renter'],
      incomeRanges: ['low', 'medium', 'high', 'prefer_not_to_say'],
      damageSeverities: ['moderate', 'severe', 'destroyed']
    }
  },
  {
    id: 'red-cross-assistance',
    name: 'American Red Cross Assistance',
    agency: 'American Red Cross',
    description: 'Immediate assistance for disaster victims including shelter, food, and financial assistance for basic needs.',
    maxAmount: 'Varies by need',
    deadline: 'Ongoing',
    deadlineUrgency: 'low',
    requiredDocuments: [
      'gov-id',
      'proof-of-occupancy',
    ],
    applicationUrl: 'https://www.redcross.org/get-help.html',
    contactInfo: {
      phone: '1-800-733-2767',
      website: 'https://www.redcross.org/',
      email: 'disaster.inquiry@redcross.org'
    },
    eligibility: {
      damageTypes: ['home', 'business', 'both'],
      ownershipStatus: ['owner', 'renter'],
      incomeRanges: ['low', 'medium', 'high', 'prefer_not_to_say'],
      damageSeverities: ['minor', 'moderate', 'severe', 'destroyed']
    }
  },
  {
    id: 'nc-211',
    name: 'NC 211 Resource Connection',
    agency: 'North Carolina 211',
    description: 'Free, confidential service connecting residents to local health and human services, including disaster recovery resources.',
    maxAmount: 'Information and referrals',
    deadline: 'Ongoing',
    deadlineUrgency: 'low',
    requiredDocuments: [
      'gov-id',
      'proof-of-occupancy',
      'income-verification',
    ],
    applicationUrl: 'https://www.nc211.org/',
    contactInfo: {
      phone: '2-1-1',
      website: 'https://www.nc211.org/',
      email: 'info@nc211.org'
    },
    eligibility: {
      damageTypes: ['home', 'business', 'both', 'other'],
      ownershipStatus: ['owner', 'renter'],
      incomeRanges: ['low', 'medium', 'high', 'prefer_not_to_say'],
      damageSeverities: ['minor', 'moderate', 'severe', 'destroyed']
    }
  },
  {
    id: 'disaster-assistance-gov',
    name: 'DisasterAssistance.gov',
    agency: 'Federal Emergency Management Agency',
    description: 'Official federal portal for disaster assistance applications, providing access to FEMA Individual Assistance and other federal programs.',
    maxAmount: 'Varies by program',
    deadline: '60 days after disaster declaration',
    deadlineUrgency: 'high',
    requiredDocuments: [
      'gov-id',
      'insurance-info',
      'damage-photos',
      'proof-of-occupancy',
      'bank-account',
    ],
    applicationUrl: 'https://www.disasterassistance.gov/',
    contactInfo: {
      phone: '1-800-621-3362',
      website: 'https://www.disasterassistance.gov/',
      email: 'fema-helpline@fema.dhs.gov'
    },
    eligibility: {
      damageTypes: ['home', 'business', 'both'],
      ownershipStatus: ['owner', 'renter'],
      incomeRanges: ['low', 'medium', 'high', 'prefer_not_to_say'],
      damageSeverities: ['minor', 'moderate', 'severe', 'destroyed']
    }
  }
];

export function getEligiblePrograms(situation: UserSituation): AidProgram[] {
  return aidPrograms.filter(program => {
    const eligibility = program.eligibility;

    // Check county if specified
    if (eligibility.counties && !eligibility.counties.includes(situation.county)) {
      return false;
    }

    // Check damage type
    if (eligibility.damageTypes && !eligibility.damageTypes.includes(situation.damageType)) {
      return false;
    }

    // Check ownership status
    if (eligibility.ownershipStatus && !eligibility.ownershipStatus.includes(situation.ownershipStatus)) {
      return false;
    }

    // Check income range
    if (eligibility.incomeRanges && !eligibility.incomeRanges.includes(situation.incomeRange)) {
      return false;
    }

    // Check farmer status
    if (eligibility.isFarmer !== undefined && eligibility.isFarmer !== situation.isFarmer) {
      return false;
    }

    // Check damage severity
    if (eligibility.damageSeverities && !eligibility.damageSeverities.includes(situation.damageSeverity)) {
      return false;
    }

    // Check insurance (if program requires no insurance)
    if (eligibility.hasInsurance !== undefined && eligibility.hasInsurance !== situation.hasInsurance) {
      return false;
    }

    // Check FEMA application status
    if (eligibility.hasAppliedToFEMA !== undefined && eligibility.hasAppliedToFEMA !== situation.hasAppliedToFEMA) {
      return false;
    }

    return true;
  });
}

export function rankProgramsByUrgency(programs: AidProgram[]): AidProgram[] {
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  
  return [...programs].sort((a, b) => {
    const urgencyA = urgencyOrder[a.deadlineUrgency];
    const urgencyB = urgencyOrder[b.deadlineUrgency];
    return urgencyA - urgencyB;
  });
}
