import type { UserSituation } from '@/lib/aid-programs';

// Every field a settings correction is allowed to touch — keeps the model's
// JSON diff from writing arbitrary keys into Firestore. Mirrors the
// `UserSituation` interface in lib/aid-programs.ts field-for-field.
export const USER_SITUATION_FIELDS: (keyof UserSituation)[] = [
  'county', 'city', 'zipCode', 'address', 'disasterAtThisAddress', 'disasterLocation',
  'damageType', 'ownershipStatus', 'hasInsurance', 'incomeRange', 'isFarmer',
  'hasAppliedToFEMA', 'damageSeverity', 'applicantCategory', 'housingStatus',
  'ageRange', 'householdSize', 'hasDisabilityOrMedicalNeed', 'vulnerablePopulations',
  'primaryNeed', 'supplementaryNeeds',
  'damageDate', 'wasDirectlyCausedByDisaster', 'isNeedUnresolved', 'needUrgency',
  'homeDamaged', 'homeType', 'homeDamagedParts', 'homeDamageCause', 'homeLivability',
  'homeInspectionStatus', 'homeRepairsCompleted', 'paidForRepairsSelf', 'hasRepairProof',
  'homeAccessDamage', 'emergencyVehicleAccess', 'wellSepticDamage', 'homeHelpNeeded',
  'rentalDamaged', 'rentalHabitable', 'rentalDamagedItems', 'landlordRepairStatus',
  'hadToLeaveRental', 'temporaryHousingPayment', 'hadRentersInsurance', 'rentalIssues',
  'personalPropertyDamaged', 'propertyNecessity', 'hasPropertyProof',
  'vehicleDamaged', 'vehicleUseTypes', 'vehicleUsable', 'hasTransportationNow', 'transportationNeeds',
  'lostFoodFromDisaster', 'utilityAccess', 'behindOnBills', 'needsUtilityHelp',
  'childcareImpacted', 'childcareProblems', 'numberOfChildrenNeedingCare', 'childAgeRanges',
  'childHasSpecialNeed', 'childcareSuppliesLost', 'payingExtraChildcare', 'childcareNeededFor',
  'medicalImpact', 'medicalAssistanceNeeded', 'medicalEquipmentDamaged',
  'dependsOnElectricMedicalEquipment', 'deathInHousehold', 'funeralAssistanceNeeded',
  'employmentImpact', 'wagesStatus', 'employmentAssistanceNeeded',
  'businessAffected', 'businessImpactTypes', 'businessOperatingStatus', 'businessDamageKind',
  'businessClosureDuration', 'businessAssistanceNeeded', 'employeesLostWages',
  'childcareAffectedBusiness', 'businessInsuranceTypes', 'filedInsuranceClaim', 'hasBusinessFinancialRecords',
  'agriculturalOperationTypes', 'agriculturalDamagedItems', 'disasterPreventedFarmActivities',
  'incomeLossType', 'hasCropInsurance', 'reportedLossTo', 'agriculturalAssistanceNeeded',
  'nonprofitAffected', 'nonprofitDamageTypes', 'increasedServiceDemand', 'nonprofitAssistanceNeeded',
  'applyingForProgramId',
  'hadInsuranceAtDisaster', 'insuranceTypesHeld', 'insuranceCoveredItems',
  'filedInsuranceClaimForDisaster', 'insuranceClaimStatus', 'receivedSettlementLetter',
  'insuranceCoveredAllLosses', 'insurancePaymentAmount', 'unpaidNeedsAfterInsurance',
  'claimPartiallyOrFullyDenied', 'claimDenialReason', 'wantsHelpWithInsuranceAppeal',
  'evidenceOfDamage', 'assistanceAlreadyReceived', 'unresolvedNeeds',
  'mostUrgentNeedDescription', 'priorityNeeds',
];

const FIELD_SET = new Set<string>(USER_SITUATION_FIELDS);

export function buildSummaryPrompt(situation: UserSituation): string {
  return `You are summarizing a disaster survivor's saved situation record for their own review, in a warm, plain-language, second-person voice ("You told us..."). Group related facts into short paragraphs (location, housing/damage, insurance, household, urgent needs) but only cover groups that actually have data. Only state facts present in the JSON below — never invent or infer anything that isn't present. If the record is sparse, say so briefly and invite them to add more. Do not use markdown headers, bold, or bullet lists — write flowing prose, 3-6 short paragraphs.

Situation record (JSON):
${JSON.stringify(situation, null, 2)}`;
}

export function buildCorrectionPrompt(situation: UserSituation, note: string): string {
  return `You maintain a structured record of a disaster survivor's situation (JSON below), used to match them to aid programs and generate document checklists. The user just sent a short note describing something that changed, or something recorded incorrectly.

Return STRICT JSON containing ONLY the fields the note actually addresses, using the exact same field names as the current record, with corrected values. Match each field's existing value type (string, boolean, number, or array of strings) — infer a sensible type if the field isn't already set. Do not include fields the note doesn't mention. Do not invent values. Respond with raw JSON only — no markdown fences, no prose, no explanation.

Current record (JSON):
${JSON.stringify(situation, null, 2)}

User's note:
"${note}"`;
}

/** Parses a model's correction response and drops any field not in the known UserSituation shape. */
export function parseCorrectionResponse(raw: string): Partial<UserSituation> {
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {};
  }

  const out: Partial<UserSituation> = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (FIELD_SET.has(key) && value !== null && value !== undefined) {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}

export function formatFieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export function formatFieldValue(value: unknown): string {
  if (value === undefined || value === null) return 'Not set';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'None';
  return String(value);
}
