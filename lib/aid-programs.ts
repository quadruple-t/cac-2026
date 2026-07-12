export interface AidProgram {
  id: string;
  name: string;
  agency: string;
  description: string;
  maxAmount: string;
  deadline: string;
  deadlineUrgency: 'high' | 'medium' | 'low';
  requiredDocuments: string[];
  applicationUrl: string;
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
      'Proof of identity (driver\'s license, passport)',
      'Insurance information',
      'Damage photos',
      'Proof of residence',
      'Bank account information for direct deposit',
      'Detailed list of damages'
    ],
    applicationUrl: 'https://www.disasterassistance.gov/',
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
      'SBA loan application',
      'Tax returns (2 years)',
      'Financial statements',
      'Insurance information',
      'Damage photos and estimates',
      'Proof of ownership or lease'
    ],
    applicationUrl: 'https://www.sba.gov/disaster',
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
      'Farm operating plan',
      'Tax returns (3 years)',
      'Proof of crop/livestock loss',
      'Insurance information',
      'Financial statements'
    ],
    applicationUrl: 'https://www.fsa.usda.gov/services/disaster-assistance',
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
      'Proof of NC residency',
      'Damage documentation',
      'Insurance information',
      'Income verification',
      'Proof of ownership or lease'
    ],
    applicationUrl: 'https://www.ncdps.gov/emergency-management',
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
      'Proof of address',
      'ID',
      'Basic information about household'
    ],
    applicationUrl: 'https://www.redcross.org/get-help.html',
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
      'Basic household information'
    ],
    applicationUrl: 'https://www.nc211.org/',
    eligibility: {
      damageTypes: ['home', 'business', 'both', 'other'],
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
