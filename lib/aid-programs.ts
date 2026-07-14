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
  /** Why this program was recommended, with a link back to the source evidence. Only set for sheet-sourced programs. */
  matchReason?: {
    sentence: string;
    sourceUrl: string;
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
  county?: string;
  city?: string;
  zipCode?: string;
  address?: string;
  /** Whether the disaster happened at the address above. `false` means `disasterLocation` holds the actual site. */
  disasterAtThisAddress?: boolean;
  disasterLocation?: string;
  damageType?: 'home' | 'business' | 'both' | 'other';
  ownershipStatus?: 'owner' | 'renter' | 'both';
  hasInsurance?: boolean;
  incomeRange?: 'low' | 'medium' | 'high' | 'prefer_not_to_say';
  isFarmer?: boolean;
  hasAppliedToFEMA?: boolean;
  damageSeverity?: 'minor' | 'moderate' | 'severe' | 'destroyed';
  /** Broader classification than `ownershipStatus`/`isFarmer` — collected for context, not yet used by eligibility matching. */
  applicantCategory?: 'individual' | 'household' | 'business' | 'nonprofit' | 'farmer' | 'property_owner';
  housingStatus?: 'homeowner' | 'renter' | 'landlord' | 'unhoused';
  ageRange?: '18-24' | '25-44' | '45-64' | '65+' | 'prefer_not_to_say';
  householdSize?: number;
  hasDisabilityOrMedicalNeed?: boolean;
  vulnerablePopulations?: ('veteran' | 'senior' | 'child' | 'pregnant')[];

  // --- Damage and Needs Assessment (section 3) ---
  // These are collected for context and are not yet used by eligibility matching.

  /** The category picked first in the section; its detail questions show immediately. */
  primaryNeed?: string;
  /** Additional categories the user checked; their detail questions are revealed on demand via the checklist. */
  supplementaryNeeds?: string[];

  // General Impact
  damageDate?: string;
  wasDirectlyCausedByDisaster?: 'yes' | 'partially' | 'no' | 'unsure';
  isNeedUnresolved?: 'yes' | 'partially' | 'fully';
  needUrgency?: 'immediate' | '24h' | '1week' | '1month' | 'long_term';

  // Home Damage / Home Access and Property Damage (homeowners)
  homeDamaged?: boolean;
  homeType?: 'single_family' | 'manufactured' | 'townhouse' | 'condo' | 'duplex' | 'farmhouse' | 'other';
  homeDamagedParts?: string[];
  homeDamageCause?: 'flooding' | 'wind' | 'fallen_tree' | 'landslide' | 'fire' | 'storm_surge' | 'sewer_backup' | 'power_surge' | 'debris_impact' | 'other';
  homeLivability?: 'yes' | 'yes_repairs_needed' | 'no_unsafe' | 'no_destroyed' | 'unsure';
  homeInspectionStatus?: 'fema' | 'insurance_adjuster' | 'contractor_engineer' | 'no' | 'scheduled';
  homeRepairsCompleted?: 'no' | 'some' | 'most' | 'all';
  paidForRepairsSelf?: boolean;
  hasRepairProof?: 'yes' | 'some' | 'no';
  homeAccessDamage?: string[];
  emergencyVehicleAccess?: 'yes' | 'no' | 'difficult' | 'unsure';
  wellSepticDamage?: string[];
  homeHelpNeeded?: string[];

  // Rental Housing Damage (renters)
  rentalDamaged?: boolean;
  rentalHabitable?: 'yes' | 'partially' | 'no' | 'unsure';
  rentalDamagedItems?: string[];
  landlordRepairStatus?: 'yes' | 'some' | 'no' | 'scheduled' | 'cannot_contact';
  hadToLeaveRental?: boolean;
  temporaryHousingPayment?: 'yes' | 'no' | 'family_friends' | 'shelter' | 'unhoused';
  hadRentersInsurance?: 'yes' | 'no' | 'unsure';
  rentalIssues?: string[];

  // Personal Property Loss
  personalPropertyDamaged?: string[];
  propertyNecessity?: 'yes' | 'no' | 'some';
  hasPropertyProof?: 'yes' | 'some' | 'no';

  // Vehicle and Transportation Damage
  vehicleDamaged?: boolean;
  vehicleUseTypes?: string[];
  vehicleUsable?: 'yes' | 'partially' | 'no' | 'destroyed';
  hasTransportationNow?: 'yes' | 'limited' | 'no';
  transportationNeeds?: string[];

  // Food, Utilities, and Essential Services
  lostFoodFromDisaster?: boolean;
  utilityAccess?: string[];
  behindOnBills?: string[];
  needsUtilityHelp?: boolean;

  // Childcare Impact
  childcareImpacted?: boolean;
  childcareProblems?: string[];
  numberOfChildrenNeedingCare?: number;
  childAgeRanges?: string[];
  childHasSpecialNeed?: 'yes' | 'no' | 'prefer_not_to_say';
  childcareSuppliesLost?: string[];
  payingExtraChildcare?: boolean;
  childcareNeededFor?: string[];

  // Medical and Dental Impact
  medicalImpact?: boolean;
  medicalAssistanceNeeded?: string[];
  medicalEquipmentDamaged?: boolean;
  dependsOnElectricMedicalEquipment?: boolean;
  deathInHousehold?: boolean;
  funeralAssistanceNeeded?: string[];

  // Employment Impact
  employmentImpact?: string[];
  wagesStatus?: 'full' | 'partial' | 'none' | 'unsure';
  employmentAssistanceNeeded?: string[];

  // Business Damage (business owners)
  businessAffected?: boolean;
  businessImpactTypes?: string[];
  businessOperatingStatus?: 'fully' | 'partially' | 'temporarily_closed' | 'permanently_closed';
  businessDamageKind?: 'physical' | 'economic' | 'both';
  businessClosureDuration?: 'lt_1_week' | '1_4_weeks' | '1_3_months' | 'gt_3_months' | 'still_closed';
  businessAssistanceNeeded?: string[];
  employeesLostWages?: 'yes' | 'no' | 'unsure';
  childcareAffectedBusiness?: 'yes' | 'no' | 'unsure';
  businessInsuranceTypes?: string[];
  filedInsuranceClaim?: 'yes' | 'no' | 'pending';
  hasBusinessFinancialRecords?: 'yes' | 'some' | 'no';

  // Agricultural Damage (farmers)
  agriculturalOperationTypes?: string[];
  agriculturalDamagedItems?: string[];
  disasterPreventedFarmActivities?: boolean;
  incomeLossType?: 'current' | 'future' | 'both';
  hasCropInsurance?: 'yes' | 'no' | 'unsure';
  reportedLossTo?: string[];
  agriculturalAssistanceNeeded?: string[];

  // Nonprofit Damage (nonprofits)
  nonprofitAffected?: boolean;
  nonprofitDamageTypes?: string[];
  increasedServiceDemand?: boolean;
  nonprofitAssistanceNeeded?: string[];

  /** A specific program the user already has in mind, from `aidPrograms`' `id`s, or 'unsure'. */
  applyingForProgramId?: string;

  // --- Section 4: Insurance, Prior Assistance, and Recovery Status ---

  // A. Insurance Coverage
  hadInsuranceAtDisaster?: 'yes' | 'no' | 'unsure';
  insuranceTypesHeld?: string[];
  insuranceCoveredItems?: string[];

  // B. Insurance Claim Status
  filedInsuranceClaimForDisaster?: 'yes' | 'no' | 'started_not_finished' | 'unsure_how' | 'do_not_plan';
  insuranceClaimStatus?: 'not_submitted' | 'submitted_waiting' | 'inspection_scheduled' | 'inspection_completed' | 'more_docs_requested' | 'partially_approved' | 'fully_approved' | 'denied' | 'closed' | 'unsure';
  receivedSettlementLetter?: 'yes' | 'no' | 'not_yet' | 'unsure';
  insuranceCoveredAllLosses?: 'yes' | 'no' | 'only_some' | 'pending' | 'unsure';
  insurancePaymentAmount?: 'nothing' | 'lt_1000' | '1000_5000' | '5001_25000' | '25001_100000' | 'gt_100000' | 'pending' | 'prefer_not_to_say';
  unpaidNeedsAfterInsurance?: string[];
  claimPartiallyOrFullyDenied?: 'yes' | 'no' | 'pending';
  claimDenialReason?: 'not_covered' | 'flood_related' | 'pre_existing' | 'deductible_too_high' | 'missing_documentation' | 'policy_expired' | 'coverage_limit_reached' | 'disputed_cause' | 'other' | 'unsure';
  wantsHelpWithInsuranceAppeal?: 'yes' | 'no' | 'maybe_later';

  // Documentation and Prior Assistance (moved here from section 3)
  evidenceOfDamage?: string[];
  assistanceAlreadyReceived?: string[];
  unresolvedNeeds?: string[];

  // Most Urgent Need (moved here from section 3)
  mostUrgentNeedDescription?: string;
  priorityNeeds?: string[];
}

export const aidPrograms: AidProgram[] = [
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
      'SBA loan application',
      'Tax returns (2 years)',
      'Financial statements',
      'Insurance information',
      'Damage photos and estimates',
      'Proof of ownership or lease'
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
      'Farm operating plan',
      'Tax returns (3 years)',
      'Proof of crop/livestock loss',
      'Insurance information',
      'Financial statements'
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
      'Proof of NC residency',
      'Damage documentation',
      'Insurance information',
      'Income verification',
      'Proof of ownership or lease'
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
      'Proof of address',
      'ID',
      'Basic information about household'
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
      'Basic household information'
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
      'Proof of identity',
      'Insurance information',
      'Damage documentation',
      'Proof of residence',
      'Bank account information'
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

    // Unanswered fields are skipped rather than disqualifying a program —
    // partial info should narrow results, never exclude the user entirely.

    // Check county if specified
    if (eligibility.counties && situation.county && !eligibility.counties.includes(situation.county)) {
      return false;
    }

    // Check damage type
    if (eligibility.damageTypes && situation.damageType && !eligibility.damageTypes.includes(situation.damageType)) {
      return false;
    }

    // Check ownership status
    if (eligibility.ownershipStatus && situation.ownershipStatus && !eligibility.ownershipStatus.includes(situation.ownershipStatus)) {
      return false;
    }

    // Check income range
    if (eligibility.incomeRanges && situation.incomeRange && !eligibility.incomeRanges.includes(situation.incomeRange)) {
      return false;
    }

    // Check farmer status
    if (eligibility.isFarmer !== undefined && situation.isFarmer !== undefined && eligibility.isFarmer !== situation.isFarmer) {
      return false;
    }

    // Check damage severity
    if (eligibility.damageSeverities && situation.damageSeverity && !eligibility.damageSeverities.includes(situation.damageSeverity)) {
      return false;
    }

    // Check insurance (if program requires no insurance)
    if (eligibility.hasInsurance !== undefined && situation.hasInsurance !== undefined && eligibility.hasInsurance !== situation.hasInsurance) {
      return false;
    }

    // Check FEMA application status
    if (eligibility.hasAppliedToFEMA !== undefined && situation.hasAppliedToFEMA !== undefined && eligibility.hasAppliedToFEMA !== situation.hasAppliedToFEMA) {
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
