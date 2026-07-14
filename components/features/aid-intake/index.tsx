'use client';

import { useState } from 'react';
import { UserSituation, aidPrograms } from '@/lib/aid-programs';
import { DocumentIcon } from '@/components/feature-icons';

interface AidIntakeFormProps {
  onSubmit: (situation: UserSituation) => void;
  /** Pre-fills the form, e.g. when the user is editing a previously-submitted situation. */
  initialData?: Partial<UserSituation>;
  /** Shown as a "Cancel" link next to submit when editing an existing situation. */
  onCancel?: () => void;
  submitLabel?: string;
}

type SectionId = 'location' | 'applicantType' | 'damageNeeds' | 'insuranceRecovery';

interface SectionMeta {
  id: SectionId;
  number: number;
  title: string;
  description: string;
  fields: (keyof UserSituation)[];
}

const SECTIONS: SectionMeta[] = [
  {
    id: 'location',
    number: 1,
    title: 'Location',
    description: 'Where the damage happened.',
    fields: ['county', 'city', 'zipCode', 'address', 'disasterAtThisAddress'],
  },
  {
    id: 'applicantType',
    number: 2,
    title: 'Applicant Type',
    description: 'Who is applying for assistance.',
    fields: [
      'applicantCategory',
      'housingStatus',
      'ageRange',
      'householdSize',
      'hasDisabilityOrMedicalNeed',
      'vulnerablePopulations',
      'ownershipStatus',
      'isFarmer',
      'incomeRange',
    ],
  },
  {
    id: 'damageNeeds',
    number: 3,
    title: 'Damage and Needs Assessment',
    description: 'What was affected, and what kind of help you need.',
    fields: [
      'primaryNeed',
      'supplementaryNeeds',
      'damageDate',
      'wasDirectlyCausedByDisaster',
      'isNeedUnresolved',
      'needUrgency',
      'damageType',
      'hasInsurance',
      'homeDamaged',
      'homeType',
      'homeDamagedParts',
      'homeDamageCause',
      'homeLivability',
      'homeInspectionStatus',
      'homeRepairsCompleted',
      'paidForRepairsSelf',
      'hasRepairProof',
      'homeAccessDamage',
      'emergencyVehicleAccess',
      'wellSepticDamage',
      'homeHelpNeeded',
      'rentalDamaged',
      'rentalHabitable',
      'rentalDamagedItems',
      'landlordRepairStatus',
      'hadToLeaveRental',
      'temporaryHousingPayment',
      'hadRentersInsurance',
      'rentalIssues',
      'personalPropertyDamaged',
      'propertyNecessity',
      'hasPropertyProof',
      'vehicleDamaged',
      'vehicleUseTypes',
      'vehicleUsable',
      'hasTransportationNow',
      'transportationNeeds',
      'lostFoodFromDisaster',
      'utilityAccess',
      'behindOnBills',
      'needsUtilityHelp',
      'childcareImpacted',
      'childcareProblems',
      'numberOfChildrenNeedingCare',
      'childAgeRanges',
      'childHasSpecialNeed',
      'childcareSuppliesLost',
      'payingExtraChildcare',
      'childcareNeededFor',
      'medicalImpact',
      'medicalAssistanceNeeded',
      'medicalEquipmentDamaged',
      'dependsOnElectricMedicalEquipment',
      'deathInHousehold',
      'funeralAssistanceNeeded',
      'employmentImpact',
      'wagesStatus',
      'employmentAssistanceNeeded',
      'businessAffected',
      'businessImpactTypes',
      'businessOperatingStatus',
      'businessDamageKind',
      'businessClosureDuration',
      'businessAssistanceNeeded',
      'employeesLostWages',
      'childcareAffectedBusiness',
      'businessInsuranceTypes',
      'filedInsuranceClaim',
      'hasBusinessFinancialRecords',
      'agriculturalOperationTypes',
      'agriculturalDamagedItems',
      'disasterPreventedFarmActivities',
      'incomeLossType',
      'hasCropInsurance',
      'reportedLossTo',
      'agriculturalAssistanceNeeded',
      'nonprofitAffected',
      'nonprofitDamageTypes',
      'increasedServiceDemand',
      'nonprofitAssistanceNeeded',
    ],
  },
  {
    id: 'insuranceRecovery',
    number: 4,
    title: 'Insurance, Prior Assistance, and Recovery Status',
    description: 'Your coverage, claims, and what still needs help.',
    fields: [
      'applyingForProgramId',
      'damageSeverity',
      'hasAppliedToFEMA',
      'hadInsuranceAtDisaster',
      'insuranceTypesHeld',
      'insuranceCoveredItems',
      'filedInsuranceClaimForDisaster',
      'insuranceClaimStatus',
      'receivedSettlementLetter',
      'insuranceCoveredAllLosses',
      'insurancePaymentAmount',
      'unpaidNeedsAfterInsurance',
      'claimPartiallyOrFullyDenied',
      'claimDenialReason',
      'wantsHelpWithInsuranceAppeal',
      'evidenceOfDamage',
      'assistanceAlreadyReceived',
      'unresolvedNeeds',
      'mostUrgentNeedDescription',
      'priorityNeeds',
    ],
  },
];

export default function AidIntakeForm({ onSubmit, initialData, onCancel, submitLabel }: AidIntakeFormProps) {
  const [formData, setFormData] = useState<Partial<UserSituation>>(initialData ?? {});
  const [openSection, setOpenSection] = useState<SectionId | null>('location');

  const setField = <K extends keyof UserSituation>(field: K, value: UserSituation[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (id: SectionId) => {
    setOpenSection(prev => (prev === id ? null : id));
  };

  const answeredCount = (section: SectionMeta) =>
    section.fields.filter(field => formData[field] !== undefined && formData[field] !== '').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as UserSituation);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
        Tell Us About Your Situation
      </h2>
      <p className="text-[#6b5a4e] mb-6 text-[1.05rem] leading-relaxed">
        We'll use this information to match you with the right aid programs.
      </p>

      {/* Disclaimer */}
      <div className="mb-8 rounded-[14px] border border-[#e4d9cf] bg-[#faf6f1] px-5 py-4 flex gap-3">
        <span className="text-[#b0673f] text-lg leading-none" aria-hidden="true">i</span>
        <p className="text-[#6b5a4e] text-[0.95rem] leading-relaxed">
          Every question below is optional. Answer only what you're comfortable sharing to stay secure —
          the more information you provide, the more accurate your results will be.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {SECTIONS.map(section => {
          const isOpen = openSection === section.id;
          const answered = answeredCount(section);

          return (
            <div
              key={section.id}
              className="rounded-[14px] border border-[#e4d9cf] bg-white overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#3d2b20] text-white text-[0.9rem] font-semibold">
                    {section.number}
                  </span>
                  <div>
                    <h3 className="font-serif text-[1.15rem] font-medium text-[#1f1610]">
                      {section.title}
                    </h3>
                    <p className="text-[#6b5a4e] text-[0.9rem]">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-none">
                  {answered > 0 && (
                    <span className="text-[0.75rem] font-medium text-[#895031] bg-[#f2ece5] rounded-full px-2.5 py-1">
                      {answered} of {section.fields.length} answered
                    </span>
                  )}
                  <span
                    className={`text-[#895031] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 border-t border-[#e4d9cf] pt-6 space-y-6">
                  {section.id === 'location' && (
                    <LocationFields formData={formData} setField={setField} />
                  )}
                  {section.id === 'applicantType' && (
                    <ApplicantTypeFields formData={formData} setField={setField} />
                  )}
                  {section.id === 'damageNeeds' && (
                    <DamageNeedsFields formData={formData} setField={setField} />
                  )}
                  {section.id === 'insuranceRecovery' && (
                    <InsuranceRecoveryFields formData={formData} setField={setField} />
                  )}
                </div>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          className="w-full bg-[#3d2b20] text-white py-3.5 px-6 rounded-[10px] font-semibold text-[1.05rem] hover:bg-[#2b1e15] focus:ring-2 focus:ring-[#b0673f] focus:ring-offset-2 transition-colors"
        >
          {submitLabel ?? 'Find My Eligible Programs'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full text-center text-[#895031] hover:text-[#6b5a4e] font-medium text-sm"
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

interface FieldsProps {
  formData: Partial<UserSituation>;
  setField: <K extends keyof UserSituation>(field: K, value: UserSituation[K]) => void;
}

/** Single-select dropdown. Callers cast the string back to the field's literal union type. */
function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
      >
        <option value="">Prefer not to say</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}) {
  return (
    <div>
      <label className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
        {label}
      </label>
      <div className="flex space-x-6">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={value === true}
            onChange={() => onChange(true)}
            className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] focus:ring-[#b0673f]"
          />
          <span className="text-[1.05rem] text-[#2a201a]">Yes</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            checked={value === false}
            onChange={() => onChange(false)}
            className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] focus:ring-[#b0673f]"
          />
          <span className="text-[1.05rem] text-[#2a201a]">No</span>
        </label>
      </div>
    </div>
  );
}

/** "Select all that apply" checkbox group. `max` optionally caps how many can be selected at once. */
function MultiSelectGroup({
  label,
  options,
  selected,
  onChange,
  max,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else if (!max || selected.length < max) {
      onChange([...selected, value]);
    }
  };
  return (
    <div>
      <label className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
        {label}
        {max && <span className="normal-case font-normal text-[#6b5a4e]"> (choose up to {max})</span>}
      </label>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {options.map(option => {
          const checked = selected.includes(option);
          const disabled = !checked && !!max && selected.length >= max;
          return (
            <label key={option} className={`flex items-center space-x-2 ${disabled ? 'opacity-40' : ''}`}>
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(option)}
                className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] rounded focus:ring-[#b0673f] focus:ring-offset-2"
              />
              <span className="text-[1.05rem] text-[#2a201a]">{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function multiValue<K extends keyof UserSituation>(formData: Partial<UserSituation>, field: K): string[] {
  return (formData[field] as unknown as string[] | undefined) ?? [];
}

function LocationFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="county" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
          What county are you in?
        </label>
        <input
          type="text"
          id="county"
          name="county"
          value={formData.county || ''}
          onChange={e => setField('county', e.target.value)}
          className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          placeholder="e.g., Buncombe County"
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
          What city are you in?
        </label>
        <input
          type="text"
          id="city"
          name="city"
          value={formData.city || ''}
          onChange={e => setField('city', e.target.value)}
          className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          placeholder="e.g., Asheville"
        />
      </div>

      <div>
        <label htmlFor="zipCode" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
          What is your ZIP code?
        </label>
        <input
          type="text"
          id="zipCode"
          name="zipCode"
          value={formData.zipCode || ''}
          onChange={e => setField('zipCode', e.target.value)}
          className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          placeholder="e.g., 28801"
          inputMode="numeric"
          pattern="[0-9]{5}(-[0-9]{4})?"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
          What is your street address?
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address || ''}
          onChange={e => setField('address', e.target.value)}
          className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          placeholder="e.g., 123 Main St"
        />
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="disasterAtThisAddress"
            checked={formData.disasterAtThisAddress !== false}
            onChange={e => setField('disasterAtThisAddress', e.target.checked)}
            className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] rounded focus:ring-[#b0673f] focus:ring-offset-2"
          />
          <span className="text-[1.05rem] font-medium text-[#2a201a]">
            Did the disaster happen at this address?
          </span>
        </label>
      </div>

      {formData.disasterAtThisAddress === false && (
        <div>
          <label htmlFor="disasterLocation" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
            Where did the disaster happen?
          </label>
          <input
            type="text"
            id="disasterLocation"
            name="disasterLocation"
            value={formData.disasterLocation || ''}
            onChange={e => setField('disasterLocation', e.target.value)}
            className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
            placeholder="e.g., 456 Oak St, Asheville, NC 28801"
          />
        </div>
      )}
    </>
  );
}

const VULNERABLE_POPULATIONS: { value: 'veteran' | 'senior' | 'child' | 'pregnant'; label: string }[] = [
  { value: 'veteran', label: 'Veteran' },
  { value: 'senior', label: 'Senior' },
  { value: 'child', label: 'Child' },
  { value: 'pregnant', label: 'Pregnant person' },
];

function ApplicantTypeFields({ formData, setField }: FieldsProps) {
  // Business/nonprofit applicants aren't a household, so the personal
  // demographic questions below don't apply to them. Undefined defaults to
  // showing them, since most applicants are individuals/households.
  const isEntityApplicant = formData.applicantCategory === 'business' || formData.applicantCategory === 'nonprofit';

  const toggleVulnerablePopulation = (value: 'veteran' | 'senior' | 'child' | 'pregnant') => {
    const current = formData.vulnerablePopulations ?? [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setField('vulnerablePopulations', next);
  };

  return (
    <>
      <div>
        <label htmlFor="applicantCategory" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
          Are you applying as an individual, household, business, nonprofit, farmer, or property owner?
        </label>
        <select
          id="applicantCategory"
          name="applicantCategory"
          value={formData.applicantCategory || ''}
          onChange={e => setField('applicantCategory', e.target.value as UserSituation['applicantCategory'])}
          className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
        >
          <option value="">Prefer not to say</option>
          <option value="individual">Individual</option>
          <option value="household">Household</option>
          <option value="business">Business</option>
          <option value="nonprofit">Nonprofit</option>
          <option value="farmer">Farmer</option>
          <option value="property_owner">Property Owner</option>
        </select>
      </div>

      {!isEntityApplicant && (
        <>
          <div>
            <label htmlFor="housingStatus" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
              Are you a homeowner, renter, landlord, or currently unhoused?
            </label>
            <select
              id="housingStatus"
              name="housingStatus"
              value={formData.housingStatus || ''}
              onChange={e => setField('housingStatus', e.target.value as UserSituation['housingStatus'])}
              className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
            >
              <option value="">Prefer not to say</option>
              <option value="homeowner">Homeowner</option>
              <option value="renter">Renter</option>
              <option value="landlord">Landlord</option>
              <option value="unhoused">Currently unhoused</option>
            </select>
          </div>

          <div>
            <label htmlFor="ageRange" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
              What is your age range?
            </label>
            <select
              id="ageRange"
              name="ageRange"
              value={formData.ageRange || ''}
              onChange={e => setField('ageRange', e.target.value as UserSituation['ageRange'])}
              className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
            >
              <option value="">Prefer not to say</option>
              <option value="18-24">18-24</option>
              <option value="25-44">25-44</option>
              <option value="45-64">45-64</option>
              <option value="65+">65+</option>
            </select>
          </div>

          {formData.applicantCategory !== 'individual' && (
            <div>
              <label htmlFor="householdSize" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
                How many people are in your household?
              </label>
              <input
                type="number"
                id="householdSize"
                name="householdSize"
                min={1}
                value={formData.householdSize ?? ''}
                onChange={e => setField('householdSize', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
                placeholder="e.g., 4"
              />
            </div>
          )}

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="hasDisabilityOrMedicalNeed"
                checked={formData.hasDisabilityOrMedicalNeed === true}
                onChange={e => setField('hasDisabilityOrMedicalNeed', e.target.checked)}
                className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] rounded focus:ring-[#b0673f] focus:ring-offset-2"
              />
              <span className="text-[1.05rem] font-medium text-[#2a201a]">
                Does anyone in your household have a disability, mobility limitation, or medical need?
              </span>
            </label>
          </div>

          <div>
            <label className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
              Is anyone in the household a veteran, senior, child, or pregnant person?
            </label>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {VULNERABLE_POPULATIONS.map(({ value, label }) => (
                <label key={value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(formData.vulnerablePopulations ?? []).includes(value)}
                    onChange={() => toggleVulnerablePopulation(value)}
                    className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] rounded focus:ring-[#b0673f] focus:ring-offset-2"
                  />
                  <span className="text-[1.05rem] text-[#2a201a]">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <div>
        <label htmlFor="ownershipStatus" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
          Do you own or rent?
        </label>
        <select
          id="ownershipStatus"
          name="ownershipStatus"
          value={formData.ownershipStatus || ''}
          onChange={e => setField('ownershipStatus', e.target.value as UserSituation['ownershipStatus'])}
          className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
        >
          <option value="">Prefer not to say</option>
          <option value="owner">Owner</option>
          <option value="renter">Renter</option>
          <option value="both">Both owner and renter</option>
        </select>
      </div>

      <div>
        <label htmlFor="isFarmer" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
          Are you a farmer or do you own agricultural land?
        </label>
        <div className="flex space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="isFarmer"
              checked={formData.isFarmer === true}
              onChange={() => setField('isFarmer', true)}
              className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] focus:ring-[#b0673f]"
            />
            <span className="text-[1.05rem] text-[#2a201a]">Yes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="isFarmer"
              checked={formData.isFarmer === false}
              onChange={() => setField('isFarmer', false)}
              className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] focus:ring-[#b0673f]"
            />
            <span className="text-[1.05rem] text-[#2a201a]">No</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="incomeRange" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
          What is your household income range?
        </label>
        <select
          id="incomeRange"
          name="incomeRange"
          value={formData.incomeRange || ''}
          onChange={e => setField('incomeRange', e.target.value as UserSituation['incomeRange'])}
          className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
        >
          <option value="">Prefer not to say</option>
          <option value="low">Under $50,000</option>
          <option value="medium">$50,000 - $100,000</option>
          <option value="high">Over $100,000</option>
        </select>
      </div>
    </>
  );
}

type NeedCategory =
  | 'home' | 'rental' | 'personal_property' | 'vehicle' | 'utilities'
  | 'childcare' | 'medical' | 'employment' | 'business' | 'agricultural' | 'nonprofit';

const NEED_CATEGORIES: { value: NeedCategory; label: string }[] = [
  { value: 'home', label: 'Home Damage' },
  { value: 'rental', label: 'Rental Housing Damage' },
  { value: 'personal_property', label: 'Personal Property Loss' },
  { value: 'vehicle', label: 'Vehicle and Transportation Damage' },
  { value: 'utilities', label: 'Food, Utilities, and Essential Services' },
  { value: 'childcare', label: 'Childcare Impact' },
  { value: 'medical', label: 'Medical, Disability, and Funeral Needs' },
  { value: 'employment', label: 'Employment and Income Loss' },
  { value: 'business', label: 'Business Damage' },
  { value: 'agricultural', label: 'Agricultural Damage' },
  { value: 'nonprofit', label: 'Nonprofit Damage' },
];

const GENERAL_IMPACT_FIELDS: (keyof UserSituation)[] = [
  'damageDate', 'wasDirectlyCausedByDisaster', 'isNeedUnresolved', 'needUrgency', 'damageType', 'hasInsurance',
];

// Which UserSituation fields belong to each category — used to compute the
// checklist's "done" checkmark.
const CATEGORY_FIELDS: Record<NeedCategory, (keyof UserSituation)[]> = {
  home: ['homeDamaged', 'homeType', 'homeDamagedParts', 'homeDamageCause', 'homeLivability', 'homeInspectionStatus', 'homeRepairsCompleted', 'paidForRepairsSelf', 'hasRepairProof', 'homeAccessDamage', 'emergencyVehicleAccess', 'wellSepticDamage', 'homeHelpNeeded'],
  rental: ['rentalDamaged', 'rentalHabitable', 'rentalDamagedItems', 'landlordRepairStatus', 'hadToLeaveRental', 'temporaryHousingPayment', 'hadRentersInsurance', 'rentalIssues'],
  personal_property: ['personalPropertyDamaged', 'propertyNecessity', 'hasPropertyProof'],
  vehicle: ['vehicleDamaged', 'vehicleUseTypes', 'vehicleUsable', 'hasTransportationNow', 'transportationNeeds'],
  utilities: ['lostFoodFromDisaster', 'utilityAccess', 'behindOnBills', 'needsUtilityHelp'],
  childcare: ['childcareImpacted', 'childcareProblems', 'numberOfChildrenNeedingCare', 'childAgeRanges', 'childHasSpecialNeed', 'childcareSuppliesLost', 'payingExtraChildcare', 'childcareNeededFor'],
  medical: ['medicalImpact', 'medicalAssistanceNeeded', 'medicalEquipmentDamaged', 'dependsOnElectricMedicalEquipment', 'deathInHousehold', 'funeralAssistanceNeeded'],
  employment: ['employmentImpact', 'wagesStatus', 'employmentAssistanceNeeded'],
  business: ['businessAffected', 'businessImpactTypes', 'businessOperatingStatus', 'businessDamageKind', 'businessClosureDuration', 'businessAssistanceNeeded', 'employeesLostWages', 'childcareAffectedBusiness', 'businessInsuranceTypes', 'filedInsuranceClaim', 'hasBusinessFinancialRecords'],
  agricultural: ['agriculturalOperationTypes', 'agriculturalDamagedItems', 'disasterPreventedFarmActivities', 'incomeLossType', 'hasCropInsurance', 'reportedLossTo', 'agriculturalAssistanceNeeded'],
  nonprofit: ['nonprofitAffected', 'nonprofitDamageTypes', 'increasedServiceDemand', 'nonprofitAssistanceNeeded'],
};

function areFieldsAnswered(formData: Partial<UserSituation>, fields: (keyof UserSituation)[]): boolean {
  return fields.some(field => {
    const value = formData[field];
    if (value === undefined || value === '') return false;
    return !Array.isArray(value) || value.length > 0;
  });
}

/** Green once done, orange while actively being viewed (and not yet done), outline otherwise. */
function checklistCircleClass(done: boolean, active: boolean): string {
  if (done) return 'bg-[#10b981] border-[#10b981]';
  if (active) return 'bg-[#b0673f] border-[#b0673f]';
  return 'border-[#e4d9cf]';
}

function GeneralImpactFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="damageDate" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
          When did the damage or loss occur?
        </label>
        <input
          type="date"
          id="damageDate"
          name="damageDate"
          value={formData.damageDate || ''}
          onChange={e => setField('damageDate', e.target.value)}
          className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
        />
      </div>

      <SelectField
        id="wasDirectlyCausedByDisaster"
        label="Was the damage directly caused by the disaster?"
        value={formData.wasDirectlyCausedByDisaster}
        onChange={v => setField('wasDirectlyCausedByDisaster', v as UserSituation['wasDirectlyCausedByDisaster'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'partially', label: 'Partially' },
          { value: 'no', label: 'No' },
          { value: 'unsure', label: 'Unsure' },
        ]}
      />

      <SelectField
        id="isNeedUnresolved"
        label="Is this need still unresolved?"
        value={formData.isNeedUnresolved}
        onChange={v => setField('isNeedUnresolved', v as UserSituation['isNeedUnresolved'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'partially', label: 'Partially resolved' },
          { value: 'fully', label: 'Fully resolved' },
        ]}
      />

      <SelectField
        id="needUrgency"
        label="How urgent is this need?"
        value={formData.needUrgency}
        onChange={v => setField('needUrgency', v as UserSituation['needUrgency'])}
        options={[
          { value: 'immediate', label: 'Immediate safety need' },
          { value: '24h', label: 'Needed within 24 hours' },
          { value: '1week', label: 'Needed within one week' },
          { value: '1month', label: 'Needed within one month' },
          { value: 'long_term', label: 'Long-term recovery need' },
        ]}
      />

      <SelectField
        id="damageType"
        label="What type of property was damaged?"
        value={formData.damageType}
        onChange={v => setField('damageType', v as UserSituation['damageType'])}
        options={[
          { value: 'home', label: 'Home' },
          { value: 'business', label: 'Business' },
          { value: 'both', label: 'Both home and business' },
          { value: 'other', label: 'Other' },
        ]}
      />

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="hasInsurance"
            checked={formData.hasInsurance === true}
            onChange={e => setField('hasInsurance', e.target.checked)}
            className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] rounded focus:ring-[#b0673f] focus:ring-offset-2"
          />
          <span className="text-[1.05rem] font-medium text-[#2a201a]">
            Do you have insurance (homeowners, renters, flood, or business)?
          </span>
        </label>
      </div>
    </>
  );
}

function HomeDamageFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <YesNoField
        label="Was your primary home damaged?"
        value={formData.homeDamaged}
        onChange={v => setField('homeDamaged', v)}
      />

      <SelectField
        id="homeType"
        label="What type of home was damaged?"
        value={formData.homeType}
        onChange={v => setField('homeType', v as UserSituation['homeType'])}
        options={[
          { value: 'single_family', label: 'Single-family house' },
          { value: 'manufactured', label: 'Manufactured or mobile home' },
          { value: 'townhouse', label: 'Townhouse' },
          { value: 'condo', label: 'Condominium' },
          { value: 'duplex', label: 'Duplex or multifamily building' },
          { value: 'farmhouse', label: 'Farmhouse' },
          { value: 'other', label: 'Other' },
        ]}
      />

      <MultiSelectGroup
        label="What parts of the home were damaged? Select all that apply."
        options={[
          'Roof', 'Exterior walls or siding', 'Foundation', 'Floors', 'Windows or doors',
          'Electrical system', 'Plumbing', 'Heating or cooling system', 'Kitchen', 'Bathroom',
          'Appliances', 'Basement or crawlspace', 'Mold or water damage', 'Fire or smoke damage',
          'Structural damage', 'Accessibility equipment or modifications', 'Other',
        ]}
        selected={multiValue(formData, 'homeDamagedParts')}
        onChange={next => setField('homeDamagedParts', next)}
      />

      <SelectField
        id="homeDamageCause"
        label="What caused the damage?"
        value={formData.homeDamageCause}
        onChange={v => setField('homeDamageCause', v as UserSituation['homeDamageCause'])}
        options={[
          { value: 'flooding', label: 'Flooding' },
          { value: 'wind', label: 'Wind' },
          { value: 'fallen_tree', label: 'Fallen tree' },
          { value: 'landslide', label: 'Landslide or mudslide' },
          { value: 'fire', label: 'Fire' },
          { value: 'storm_surge', label: 'Storm surge' },
          { value: 'sewer_backup', label: 'Sewer backup' },
          { value: 'power_surge', label: 'Power surge' },
          { value: 'debris_impact', label: 'Debris impact' },
          { value: 'other', label: 'Other' },
        ]}
      />

      <SelectField
        id="homeLivability"
        label="Can you currently live safely in the home?"
        value={formData.homeLivability}
        onChange={v => setField('homeLivability', v as UserSituation['homeLivability'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'yes_repairs_needed', label: 'Yes, but repairs are needed' },
          { value: 'no_unsafe', label: 'No, the home is unsafe' },
          { value: 'no_destroyed', label: 'No, the home was destroyed' },
          { value: 'unsure', label: 'Unsure' },
        ]}
      />

      <SelectField
        id="homeInspectionStatus"
        label="Has the home been inspected?"
        value={formData.homeInspectionStatus}
        onChange={v => setField('homeInspectionStatus', v as UserSituation['homeInspectionStatus'])}
        options={[
          { value: 'fema', label: 'Yes, by FEMA' },
          { value: 'insurance_adjuster', label: 'Yes, by an insurance adjuster' },
          { value: 'contractor_engineer', label: 'Yes, by a contractor or engineer' },
          { value: 'no', label: 'No' },
          { value: 'scheduled', label: 'Inspection scheduled' },
        ]}
      />

      <SelectField
        id="homeRepairsCompleted"
        label="Have repairs already been completed?"
        value={formData.homeRepairsCompleted}
        onChange={v => setField('homeRepairsCompleted', v as UserSituation['homeRepairsCompleted'])}
        options={[
          { value: 'no', label: 'No' },
          { value: 'some', label: 'Some repairs' },
          { value: 'most', label: 'Most repairs' },
          { value: 'all', label: 'All repairs' },
        ]}
      />

      <YesNoField
        label="Did you pay for any repairs yourself?"
        value={formData.paidForRepairsSelf}
        onChange={v => setField('paidForRepairsSelf', v)}
      />

      <SelectField
        id="hasRepairProof"
        label="Do you have receipts, invoices, photographs, estimates, or proof of payment?"
        value={formData.hasRepairProof}
        onChange={v => setField('hasRepairProof', v as UserSituation['hasRepairProof'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'some', label: 'Some' },
          { value: 'no', label: 'No' },
        ]}
      />

      <p className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#895031] pt-2">Access &amp; Property</p>

      <MultiSelectGroup
        label="Was access to your home damaged?"
        options={['Private road', 'Driveway', 'Bridge', 'Culvert', 'Retaining wall', 'Steps or ramp', 'No access damage']}
        selected={multiValue(formData, 'homeAccessDamage')}
        onChange={next => setField('homeAccessDamage', next)}
      />

      <SelectField
        id="emergencyVehicleAccess"
        label="Can emergency vehicles currently reach your home?"
        value={formData.emergencyVehicleAccess}
        onChange={v => setField('emergencyVehicleAccess', v as UserSituation['emergencyVehicleAccess'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'difficult', label: 'Only with difficulty' },
          { value: 'unsure', label: 'Unsure' },
        ]}
      />

      <MultiSelectGroup
        label="Was your well or septic system damaged?"
        options={['Private well', 'Septic tank', 'Drain field', 'Water lines', 'Water contamination', 'No damage', 'Unsure']}
        selected={multiValue(formData, 'wellSepticDamage')}
        onChange={next => setField('wellSepticDamage', next)}
      />

      <MultiSelectGroup
        label="Do you need help with any of the following?"
        options={[
          'Debris removal', 'Tree removal', 'Mold remediation', 'Tarping', 'Demolition',
          'Temporary repairs', 'Permanent repairs', 'Accessibility modifications', 'Rebuilding', 'Relocation',
        ]}
        selected={multiValue(formData, 'homeHelpNeeded')}
        onChange={next => setField('homeHelpNeeded', next)}
      />
    </>
  );
}

function RentalHousingFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <YesNoField
        label="Was the home or apartment you rented damaged?"
        value={formData.rentalDamaged}
        onChange={v => setField('rentalDamaged', v)}
      />

      <SelectField
        id="rentalHabitable"
        label="Is the rental currently safe and habitable?"
        value={formData.rentalHabitable}
        onChange={v => setField('rentalHabitable', v as UserSituation['rentalHabitable'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'partially', label: 'Partially' },
          { value: 'no', label: 'No' },
          { value: 'unsure', label: 'Unsure' },
        ]}
      />

      <MultiSelectGroup
        label="What was damaged?"
        options={['The building', 'My personal belongings', 'Furniture', 'Clothing', 'Appliances I owned', 'Electronics', 'Medical equipment', 'Vehicle', 'Other']}
        selected={multiValue(formData, 'rentalDamagedItems')}
        onChange={next => setField('rentalDamagedItems', next)}
      />

      <SelectField
        id="landlordRepairStatus"
        label="Has your landlord made repairs?"
        value={formData.landlordRepairStatus}
        onChange={v => setField('landlordRepairStatus', v as UserSituation['landlordRepairStatus'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'some', label: 'Some repairs' },
          { value: 'no', label: 'No' },
          { value: 'scheduled', label: 'Repairs are scheduled' },
          { value: 'cannot_contact', label: 'I cannot contact my landlord' },
        ]}
      />

      <YesNoField
        label="Did you have to leave the rental because of the damage?"
        value={formData.hadToLeaveRental}
        onChange={v => setField('hadToLeaveRental', v)}
      />

      <SelectField
        id="temporaryHousingPayment"
        label="Are you currently paying for temporary housing?"
        value={formData.temporaryHousingPayment}
        onChange={v => setField('temporaryHousingPayment', v as UserSituation['temporaryHousingPayment'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'family_friends', label: 'Staying with family or friends' },
          { value: 'shelter', label: 'Staying in a shelter' },
          { value: 'unhoused', label: 'Currently unhoused' },
        ]}
      />

      <SelectField
        id="hadRentersInsurance"
        label="Did you have renters insurance?"
        value={formData.hadRentersInsurance}
        onChange={v => setField('hadRentersInsurance', v as UserSituation['hadRentersInsurance'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'unsure', label: 'Unsure' },
        ]}
      />

      <MultiSelectGroup
        label="Are you facing any of the following?"
        options={[
          'Eviction', 'Lease termination', 'Rent charges for an unsafe property', 'Security-deposit dispute',
          'Landlord refusing repairs', 'Loss of rental assistance', 'Need for a new rental deposit', 'Need for moving assistance',
        ]}
        selected={multiValue(formData, 'rentalIssues')}
        onChange={next => setField('rentalIssues', next)}
      />
    </>
  );
}

function PersonalPropertyFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <MultiSelectGroup
        label="Which personal belongings were damaged or lost?"
        options={[
          'Clothing', 'Beds or furniture', 'Refrigerator or cooking equipment', 'Washer or dryer',
          'Computer or phone', 'Work tools', 'School supplies', 'Medical equipment', 'Mobility equipment',
          'Eyeglasses or hearing aids', 'Important documents', "Children's items", 'Other essential belongings',
        ]}
        selected={multiValue(formData, 'personalPropertyDamaged')}
        onChange={next => setField('personalPropertyDamaged', next)}
      />

      <SelectField
        id="propertyNecessity"
        label="Are these belongings necessary for daily living, work, school, or medical care?"
        value={formData.propertyNecessity}
        onChange={v => setField('propertyNecessity', v as UserSituation['propertyNecessity'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'some', label: 'Some of them' },
        ]}
      />

      <SelectField
        id="hasPropertyProof"
        label="Do you have photographs, receipts, ownership records, or replacement estimates?"
        value={formData.hasPropertyProof}
        onChange={v => setField('hasPropertyProof', v as UserSituation['hasPropertyProof'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'some', label: 'Some' },
          { value: 'no', label: 'No' },
        ]}
      />
    </>
  );
}

function VehicleFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <YesNoField
        label="Was a vehicle damaged or destroyed?"
        value={formData.vehicleDamaged}
        onChange={v => setField('vehicleDamaged', v)}
      />

      <MultiSelectGroup
        label="Was the vehicle used for any of the following?"
        options={[
          'Traveling to work', 'Medical appointments', 'School', 'Childcare transportation',
          'Farm operations', 'Business operations', 'Disability-related transportation', 'General household transportation',
        ]}
        selected={multiValue(formData, 'vehicleUseTypes')}
        onChange={next => setField('vehicleUseTypes', next)}
      />

      <SelectField
        id="vehicleUsable"
        label="Is the vehicle currently usable?"
        value={formData.vehicleUsable}
        onChange={v => setField('vehicleUsable', v as UserSituation['vehicleUsable'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'partially', label: 'Only partially' },
          { value: 'no', label: 'No' },
          { value: 'destroyed', label: 'Destroyed' },
        ]}
      />

      <SelectField
        id="hasTransportationNow"
        label="Do you have transportation right now?"
        value={formData.hasTransportationNow}
        onChange={v => setField('hasTransportationNow', v as UserSituation['hasTransportationNow'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'limited', label: 'Limited transportation' },
          { value: 'no', label: 'No' },
        ]}
      />

      <MultiSelectGroup
        label="Do you need assistance with:"
        options={[
          'Vehicle repair', 'Vehicle replacement', 'Public transportation', 'Rides to medical appointments',
          'Rides to work', 'Rides to school or childcare', 'Accessible transportation',
        ]}
        selected={multiValue(formData, 'transportationNeeds')}
        onChange={next => setField('transportationNeeds', next)}
      />
    </>
  );
}

function UtilitiesFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <YesNoField
        label="Did you lose food because of the disaster or a power outage?"
        value={formData.lostFoodFromDisaster}
        onChange={v => setField('lostFoodFromDisaster', v)}
      />

      <MultiSelectGroup
        label="Do you currently have reliable access to:"
        options={['Food', 'Drinking water', 'Electricity', 'Heating', 'Air conditioning', 'Running water', 'Internet', 'Phone service', 'None of the above']}
        selected={multiValue(formData, 'utilityAccess')}
        onChange={next => setField('utilityAccess', next)}
      />

      <MultiSelectGroup
        label="Are you behind on any of the following because of the disaster?"
        options={['Electric bill', 'Water bill', 'Gas bill', 'Phone bill', 'Internet bill', 'Rent', 'Mortgage']}
        selected={multiValue(formData, 'behindOnBills')}
        onChange={next => setField('behindOnBills', next)}
      />

      <YesNoField
        label="Do you need emergency help paying for utilities or reconnecting service?"
        value={formData.needsUtilityHelp}
        onChange={v => setField('needsUtilityHelp', v)}
      />
    </>
  );
}

function ChildcareFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <YesNoField
        label="Did the disaster affect your ability to care for or supervise a child?"
        value={formData.childcareImpacted}
        onChange={v => setField('childcareImpacted', v)}
      />

      <MultiSelectGroup
        label="What childcare-related problem are you experiencing?"
        options={[
          'Childcare center closed', 'School closed', 'Childcare provider unavailable', 'Childcare facility damaged',
          'Transportation to childcare unavailable', 'I had to miss work to care for a child',
          'I need temporary or emergency childcare', 'I need help paying for childcare',
          'I need childcare while completing repairs or applications', 'I need childcare during medical appointments', 'Other',
        ]}
        selected={multiValue(formData, 'childcareProblems')}
        onChange={next => setField('childcareProblems', next)}
      />

      <div>
        <label htmlFor="numberOfChildrenNeedingCare" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
          How many children need childcare assistance?
        </label>
        <input
          type="number"
          id="numberOfChildrenNeedingCare"
          name="numberOfChildrenNeedingCare"
          min={0}
          value={formData.numberOfChildrenNeedingCare ?? ''}
          onChange={e => setField('numberOfChildrenNeedingCare', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          placeholder="e.g., 2"
        />
      </div>

      <MultiSelectGroup
        label="What are their age ranges?"
        options={['Under 1', 'Ages 1–2', 'Ages 3–5', 'Ages 6–12', 'Ages 13–17']}
        selected={multiValue(formData, 'childAgeRanges')}
        onChange={next => setField('childAgeRanges', next)}
      />

      <SelectField
        id="childHasSpecialNeed"
        label="Does any child have a disability, medical condition, or specialized care need?"
        value={formData.childHasSpecialNeed}
        onChange={v => setField('childHasSpecialNeed', v as UserSituation['childHasSpecialNeed'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'prefer_not_to_say', label: 'Prefer not to answer' },
        ]}
      />

      <MultiSelectGroup
        label="Were childcare supplies damaged or lost?"
        options={['Crib', 'Car seat', 'Formula', 'Diapers', 'Clothing', 'School supplies', 'Medical supplies', 'Other']}
        selected={multiValue(formData, 'childcareSuppliesLost')}
        onChange={next => setField('childcareSuppliesLost', next)}
      />

      <YesNoField
        label="Are you currently paying additional childcare costs because of the disaster?"
        value={formData.payingExtraChildcare}
        onChange={v => setField('payingExtraChildcare', v)}
      />

      <MultiSelectGroup
        label="Do you need childcare immediately in order to:"
        options={[
          'Return to work', 'Search for work', 'Attend school', 'Apply for disaster assistance',
          'Attend medical appointments', 'Complete home repairs', 'Relocate', 'Handle legal or insurance matters',
        ]}
        selected={multiValue(formData, 'childcareNeededFor')}
        onChange={next => setField('childcareNeededFor', next)}
      />
    </>
  );
}

function MedicalFuneralFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <YesNoField
        label="Did anyone in your household experience a disaster-related injury, illness, or medical expense?"
        value={formData.medicalImpact}
        onChange={v => setField('medicalImpact', v)}
      />

      <MultiSelectGroup
        label="What type of assistance is needed?"
        options={[
          'Emergency medical care', 'Dental care', 'Prescription replacement', 'Medical-equipment replacement',
          'Eyeglasses', 'Hearing aids', 'Mobility equipment', 'Mental-health treatment',
          'Transportation to medical care', 'Home healthcare', 'Other',
        ]}
        selected={multiValue(formData, 'medicalAssistanceNeeded')}
        onChange={next => setField('medicalAssistanceNeeded', next)}
      />

      <YesNoField
        label="Was medical equipment damaged because of flooding, fire, or power loss?"
        value={formData.medicalEquipmentDamaged}
        onChange={v => setField('medicalEquipmentDamaged', v)}
      />

      <YesNoField
        label="Does anyone depend on electricity for medical equipment?"
        value={formData.dependsOnElectricMedicalEquipment}
        onChange={v => setField('dependsOnElectricMedicalEquipment', v)}
      />

      <YesNoField
        label="Did the disaster cause a death in your household or immediate family?"
        value={formData.deathInHousehold}
        onChange={v => setField('deathInHousehold', v)}
      />

      <MultiSelectGroup
        label="Do you need assistance with:"
        options={['Funeral expenses', 'Burial or cremation', 'Transportation of remains', 'Death certificates', 'Counseling', 'Legal or estate matters']}
        selected={multiValue(formData, 'funeralAssistanceNeeded')}
        onChange={next => setField('funeralAssistanceNeeded', next)}
      />
    </>
  );
}

function EmploymentFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <MultiSelectGroup
        label="Did the disaster affect your job or income?"
        options={[
          'Lost my job', 'Lost work hours', 'Workplace temporarily closed', 'Workplace permanently closed',
          'Unable to work because of injury', 'Unable to work because of childcare needs',
          'Unable to work because of transportation problems', 'Self-employment income decreased', 'No employment impact',
        ]}
        selected={multiValue(formData, 'employmentImpact')}
        onChange={next => setField('employmentImpact', next)}
      />

      <SelectField
        id="wagesStatus"
        label="Are you currently receiving wages or paid leave?"
        value={formData.wagesStatus}
        onChange={v => setField('wagesStatus', v as UserSituation['wagesStatus'])}
        options={[
          { value: 'full', label: 'Full wages' },
          { value: 'partial', label: 'Partial wages' },
          { value: 'none', label: 'No wages' },
          { value: 'unsure', label: 'Unsure' },
        ]}
      />

      <MultiSelectGroup
        label="Do you need assistance with:"
        options={[
          'Unemployment benefits', 'Disaster unemployment assistance', 'Job search', 'Job training',
          'Transportation to work', 'Childcare so you can return to work', 'Replacing work tools or equipment',
        ]}
        selected={multiValue(formData, 'employmentAssistanceNeeded')}
        onChange={next => setField('employmentAssistanceNeeded', next)}
      />
    </>
  );
}

function BusinessDamageFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <YesNoField
        label="Was your business affected by the disaster?"
        value={formData.businessAffected}
        onChange={v => setField('businessAffected', v)}
      />

      <MultiSelectGroup
        label="What kind of business impact occurred?"
        options={[
          'Building damage', 'Equipment damage', 'Inventory loss', 'Vehicle damage', 'Utility interruption',
          'Internet or communication outage', 'Road or access damage', 'Employee displacement',
          'Temporary closure', 'Permanent closure', 'Lost customers', 'Lost revenue',
          'Supply-chain disruption', 'Records or data loss', 'Other',
        ]}
        selected={multiValue(formData, 'businessImpactTypes')}
        onChange={next => setField('businessImpactTypes', next)}
      />

      <SelectField
        id="businessOperatingStatus"
        label="Is the business currently operating?"
        value={formData.businessOperatingStatus}
        onChange={v => setField('businessOperatingStatus', v as UserSituation['businessOperatingStatus'])}
        options={[
          { value: 'fully', label: 'Fully operating' },
          { value: 'partially', label: 'Partially operating' },
          { value: 'temporarily_closed', label: 'Temporarily closed' },
          { value: 'permanently_closed', label: 'Permanently closed' },
        ]}
      />

      <SelectField
        id="businessDamageKind"
        label="Did the business experience physical damage, economic loss, or both?"
        value={formData.businessDamageKind}
        onChange={v => setField('businessDamageKind', v as UserSituation['businessDamageKind'])}
        options={[
          { value: 'physical', label: 'Physical damage only' },
          { value: 'economic', label: 'Economic loss only' },
          { value: 'both', label: 'Both' },
        ]}
      />

      <SelectField
        id="businessClosureDuration"
        label="How long was or has the business been closed?"
        value={formData.businessClosureDuration}
        onChange={v => setField('businessClosureDuration', v as UserSituation['businessClosureDuration'])}
        options={[
          { value: 'lt_1_week', label: 'Less than one week' },
          { value: '1_4_weeks', label: 'One to four weeks' },
          { value: '1_3_months', label: 'One to three months' },
          { value: 'gt_3_months', label: 'More than three months' },
          { value: 'still_closed', label: 'Still closed' },
        ]}
      />

      <MultiSelectGroup
        label="What assistance does the business need?"
        options={[
          'Repair funding', 'Equipment replacement', 'Inventory replacement', 'Working capital',
          'Payroll assistance', 'Rent or mortgage assistance', 'Utility assistance', 'Temporary operating space',
          'Technology replacement', 'Legal or insurance help', 'Employee retention assistance',
          'Childcare assistance for employees', 'Other',
        ]}
        selected={multiValue(formData, 'businessAssistanceNeeded')}
        onChange={next => setField('businessAssistanceNeeded', next)}
      />

      <SelectField
        id="employeesLostWages"
        label="Did employees lose work hours or wages?"
        value={formData.employeesLostWages}
        onChange={v => setField('employeesLostWages', v as UserSituation['employeesLostWages'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'unsure', label: 'Unsure' },
        ]}
      />

      <SelectField
        id="childcareAffectedBusiness"
        label="Did childcare closures prevent you or your employees from working?"
        value={formData.childcareAffectedBusiness}
        onChange={v => setField('childcareAffectedBusiness', v as UserSituation['childcareAffectedBusiness'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'unsure', label: 'Unsure' },
        ]}
      />

      <MultiSelectGroup
        label="Did the business have insurance?"
        options={['Commercial property insurance', 'Flood insurance', 'Business interruption insurance', 'Vehicle insurance', 'No insurance', 'Unsure']}
        selected={multiValue(formData, 'businessInsuranceTypes')}
        onChange={next => setField('businessInsuranceTypes', next)}
      />

      <SelectField
        id="filedInsuranceClaim"
        label="Have you filed an insurance claim?"
        value={formData.filedInsuranceClaim}
        onChange={v => setField('filedInsuranceClaim', v as UserSituation['filedInsuranceClaim'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'pending', label: 'Pending' },
        ]}
      />

      <SelectField
        id="hasBusinessFinancialRecords"
        label="Do you have financial records showing revenue before and after the disaster?"
        value={formData.hasBusinessFinancialRecords}
        onChange={v => setField('hasBusinessFinancialRecords', v as UserSituation['hasBusinessFinancialRecords'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'some', label: 'Some' },
          { value: 'no', label: 'No' },
        ]}
      />
    </>
  );
}

function AgriculturalFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <MultiSelectGroup
        label="What type of agricultural operation was affected?"
        options={['Crops', 'Livestock', 'Dairy', 'Poultry', 'Nursery', 'Greenhouse', 'Orchard', 'Timber or forestland', 'Aquaculture', 'Beekeeping', 'Other']}
        selected={multiValue(formData, 'agriculturalOperationTypes')}
        onChange={next => setField('agriculturalOperationTypes', next)}
      />

      <MultiSelectGroup
        label="What was damaged or lost?"
        options={[
          'Crops', 'Livestock', 'Feed', 'Fencing', 'Barns', 'Greenhouses', 'Farm equipment', 'Irrigation systems',
          'Wells', 'Farm roads', 'Bridges or culverts', 'Stored products', 'Timber', 'Soil or erosion damage',
          'Future production', 'Market access', 'Other',
        ]}
        selected={multiValue(formData, 'agriculturalDamagedItems')}
        onChange={next => setField('agriculturalDamagedItems', next)}
      />

      <YesNoField
        label="Did the disaster prevent you from planting, harvesting, feeding livestock, or reaching markets?"
        value={formData.disasterPreventedFarmActivities}
        onChange={v => setField('disasterPreventedFarmActivities', v)}
      />

      <SelectField
        id="incomeLossType"
        label="Did you lose current income, future income, or both?"
        value={formData.incomeLossType}
        onChange={v => setField('incomeLossType', v as UserSituation['incomeLossType'])}
        options={[
          { value: 'current', label: 'Current income' },
          { value: 'future', label: 'Future income' },
          { value: 'both', label: 'Both' },
        ]}
      />

      <SelectField
        id="hasCropInsurance"
        label="Do you have crop insurance or another agricultural insurance policy?"
        value={formData.hasCropInsurance}
        onChange={v => setField('hasCropInsurance', v as UserSituation['hasCropInsurance'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'unsure', label: 'Unsure' },
        ]}
      />

      <MultiSelectGroup
        label="Have you reported the loss to any of the following?"
        options={['USDA Farm Service Agency', 'USDA Natural Resources Conservation Service', 'Crop-insurance provider', 'NC Department of Agriculture', 'Cooperative Extension', 'None yet']}
        selected={multiValue(formData, 'reportedLossTo')}
        onChange={next => setField('reportedLossTo', next)}
      />

      <MultiSelectGroup
        label="Do you need assistance with:"
        options={[
          'Emergency feed', 'Livestock shelter', 'Veterinary care', 'Debris removal', 'Farm-road repair',
          'Fencing', 'Equipment replacement', 'Crop loss', 'Timber loss', 'Market loss', 'Future economic loss', 'Operating funds',
        ]}
        selected={multiValue(formData, 'agriculturalAssistanceNeeded')}
        onChange={next => setField('agriculturalAssistanceNeeded', next)}
      />
    </>
  );
}

function NonprofitFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <YesNoField
        label="Was your nonprofit, church, or community organization affected?"
        value={formData.nonprofitAffected}
        onChange={v => setField('nonprofitAffected', v)}
      />

      <MultiSelectGroup
        label="What was damaged or disrupted?"
        options={[
          'Building', 'Equipment', 'Vehicles', 'Food or emergency supplies', 'Records', 'Utilities',
          'Service-delivery location', 'Volunteer capacity', 'Staff capacity', 'Revenue or donations', 'Other',
        ]}
        selected={multiValue(formData, 'nonprofitDamageTypes')}
        onChange={next => setField('nonprofitDamageTypes', next)}
      />

      <YesNoField
        label="Did the disaster increase demand for your services?"
        value={formData.increasedServiceDemand}
        onChange={v => setField('increasedServiceDemand', v)}
      />

      <MultiSelectGroup
        label="What assistance is needed?"
        options={[
          'Facility repairs', 'Equipment replacement', 'Temporary operating space', 'Transportation',
          'Food or supply replacement', 'Volunteer support', 'Staff funding', 'Infrastructure repair',
          'Loan or grant assistance', 'Technical assistance',
        ]}
        selected={multiValue(formData, 'nonprofitAssistanceNeeded')}
        onChange={next => setField('nonprofitAssistanceNeeded', next)}
      />
    </>
  );
}

const CATEGORY_COMPONENTS: Record<NeedCategory, (props: FieldsProps) => React.JSX.Element> = {
  home: HomeDamageFields,
  rental: RentalHousingFields,
  personal_property: PersonalPropertyFields,
  vehicle: VehicleFields,
  utilities: UtilitiesFields,
  childcare: ChildcareFields,
  medical: MedicalFuneralFields,
  employment: EmploymentFields,
  business: BusinessDamageFields,
  agricultural: AgriculturalFields,
  nonprofit: NonprofitFields,
};

function DamageNeedsFields({ formData, setField }: FieldsProps) {
  // Which single section the main column currently shows. null means the
  // primary/secondary picker itself.
  const [activeView, setActiveView] = useState<'general' | NeedCategory | null>(null);
  // Tracked separately from activeView so a category's questions stay
  // marked "opened" (and its checkmark meaningful) after navigating away.
  const [openedSupplementary, setOpenedSupplementary] = useState<NeedCategory[]>([]);

  const primaryNeed = formData.primaryNeed as NeedCategory | undefined;
  const supplementaryNeeds = (formData.supplementaryNeeds as NeedCategory[] | undefined) ?? [];

  const setPrimaryNeed = (value: string) => {
    setField('primaryNeed', value);
    if (supplementaryNeeds.includes(value as NeedCategory)) {
      setField('supplementaryNeeds', supplementaryNeeds.filter(v => v !== value));
    }
  };

  const toggleSupplementaryNeed = (value: NeedCategory) => {
    const next = supplementaryNeeds.includes(value)
      ? supplementaryNeeds.filter(v => v !== value)
      : [...supplementaryNeeds, value];
    setField('supplementaryNeeds', next);
    if (!next.includes(value) && activeView === value) {
      setActiveView(null);
    }
  };

  const goToSection = (view: 'general' | NeedCategory) => {
    setActiveView(view);
    if (view !== 'general' && view !== primaryNeed) {
      setOpenedSupplementary(prev => (prev.includes(view) ? prev : [...prev, view]));
    }
  };

  return (
    <div className="flex gap-8 items-start">
      <div className="flex-1 min-w-0 space-y-6">
        {activeView === null ? (
          <>
            <div>
              <label htmlFor="primaryNeed" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
                What is your primary need or type of damage?
              </label>
              <select
                id="primaryNeed"
                name="primaryNeed"
                value={formData.primaryNeed || ''}
                onChange={e => setPrimaryNeed(e.target.value)}
                className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
              >
                <option value="">Select one</option>
                {NEED_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
                Do you have any other needs or damage? Select all that apply.
              </label>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {NEED_CATEGORIES.filter(cat => cat.value !== primaryNeed).map(cat => (
                  <label key={cat.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={supplementaryNeeds.includes(cat.value)}
                      onChange={() => toggleSupplementaryNeed(cat.value)}
                      className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] rounded focus:ring-[#b0673f] focus:ring-offset-2"
                    />
                    <span className="text-[1.05rem] text-[#2a201a]">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {(!primaryNeed && supplementaryNeeds.length === 0) && (
              <p className="text-[#6b5a4e] text-[0.9rem]">
                Pick a need above, then find it in the checklist on the right to answer its questions.
              </p>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveView(null)}
              className="text-[#895031] hover:text-[#6b5a4e] font-medium text-sm"
            >
              ← Edit your needs
            </button>

            {/* Clearly names whichever section is currently active, so it's
                never ambiguous what the questions below belong to. */}
            <div className="border-b border-[#e4d9cf] pb-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#895031] mb-1.5">
                You&apos;re answering
              </p>
              <h3 className="font-serif text-[1.4rem] font-medium text-[#1f1610] flex items-center gap-2">
                {activeView === 'general' && <DocumentIcon className="text-[#b0673f]" />}
                {activeView === 'general' ? 'General Impact' : NEED_CATEGORIES.find(c => c.value === activeView)?.label}
              </h3>
            </div>

            {activeView === 'general' ? (
              <GeneralImpactFields formData={formData} setField={setField} />
            ) : (
              (() => {
                const Comp = CATEGORY_COMPONENTS[activeView];
                return <Comp formData={formData} setField={setField} />;
              })()
            )}
          </>
        )}
      </div>

      {/* Read-only reflection of General Impact + the user's chosen needs —
          no input controls here. Clicking an item replaces whatever the main
          column is showing (the picker or another section) with that one. */}
      <aside className="w-64 flex-none rounded-[14px] border border-[#e4d9cf] bg-[#faf6f1] p-5 sticky top-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#895031] mb-4">
          Your Needs Checklist
        </p>

        {(() => {
          const generalDone = areFieldsAnswered(formData, GENERAL_IMPACT_FIELDS);
          const generalActive = activeView === 'general';
          return (
            <button
              type="button"
              onClick={() => goToSection('general')}
              disabled={!primaryNeed}
              className={`w-full flex items-center gap-2 rounded-[10px] px-2.5 py-2 mb-1 text-left transition-colors ${
                generalActive ? 'bg-white' : 'hover:bg-white'
              } disabled:hover:bg-transparent disabled:cursor-default`}
            >
              <span
                className={`flex h-4 w-4 flex-none items-center justify-center rounded-full border text-[0.6rem] text-white ${checklistCircleClass(generalDone, generalActive)}`}
                aria-hidden="true"
              >
                {generalDone && !generalActive ? '✓' : ''}
              </span>
              <DocumentIcon className={generalActive ? 'text-[#b0673f]' : primaryNeed ? 'text-[#895031]' : 'text-[#b8ab9e]'} />
              <span
                className={`flex-1 text-[0.85rem] ${generalActive ? 'font-bold' : 'font-semibold'} ${
                  generalActive ? 'text-[#b0673f]' : primaryNeed ? 'text-[#1f1610]' : 'text-[#b8ab9e]'
                }`}
              >
                General Impact
              </span>
              {generalActive && (
                <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-[#b0673f]">Viewing</span>
              )}
            </button>
          );
        })()}
        <p className="text-[0.75rem] text-[#6b5a4e] mb-4 pl-[26px]">
          {primaryNeed
            ? 'General questions about your situation — always available.'
            : 'Unlocks once you pick a primary need below.'}
        </p>

        {/* Primary and Secondary Needs stem from General Impact. */}
        <div className="border-l-2 border-[#e4d9cf] pl-4 ml-1 space-y-1.5">
          {primaryNeed && (() => {
            const primaryDone = areFieldsAnswered(formData, CATEGORY_FIELDS[primaryNeed]);
            const primaryActive = activeView === primaryNeed;
            return (
              <button
                type="button"
                onClick={() => goToSection(primaryNeed)}
                className={`w-full flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-left text-[0.85rem] transition-colors ${
                  primaryActive ? 'bg-white text-[#1f1610] font-bold' : 'text-[#1f1610] font-medium hover:bg-white'
                }`}
              >
                <span
                  className={`flex h-4 w-4 flex-none items-center justify-center rounded-full border text-[0.6rem] text-white ${checklistCircleClass(primaryDone, primaryActive)}`}
                  aria-hidden="true"
                >
                  {primaryDone && !primaryActive ? '✓' : ''}
                </span>
                <span className="flex-1">{NEED_CATEGORIES.find(c => c.value === primaryNeed)?.label}</span>
                <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-[#b0673f]">
                  {primaryActive ? 'Viewing' : 'Primary'}
                </span>
              </button>
            );
          })()}

          {supplementaryNeeds.map(cat => {
            const meta = NEED_CATEGORIES.find(c => c.value === cat);
            if (!meta) return null;
            const done = areFieldsAnswered(formData, CATEGORY_FIELDS[cat]);
            const isActive = activeView === cat;
            const wasOpened = openedSupplementary.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => goToSection(cat)}
                className={`w-full flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-left text-[0.85rem] transition-colors ${
                  isActive ? 'bg-white text-[#1f1610] font-bold' : wasOpened ? 'text-[#1f1610] hover:bg-white' : 'text-[#6b5a4e] hover:bg-white'
                }`}
              >
                <span
                  className={`flex h-4 w-4 flex-none items-center justify-center rounded-full border text-[0.6rem] text-white ${checklistCircleClass(done, isActive)}`}
                  aria-hidden="true"
                >
                  {done && !isActive ? '✓' : ''}
                </span>
                <span className="flex-1">{meta.label}</span>
                {isActive && (
                  <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-[#b0673f]">Viewing</span>
                )}
              </button>
            );
          })}

          {!primaryNeed && supplementaryNeeds.length === 0 && (
            <p className="text-[0.8rem] text-[#6b5a4e] italic">Nothing selected yet.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

function InsuranceOverviewFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <SelectField
        id="applyingForProgramId"
        label="What are you applying for?"
        value={formData.applyingForProgramId}
        onChange={v => setField('applyingForProgramId', v)}
        options={[
          { value: 'unsure', label: "I'm not sure — show me what I qualify for" },
          ...aidPrograms.map(program => ({ value: program.id, label: program.name })),
        ]}
      />

      <SelectField
        id="damageSeverity"
        label="How would you describe the damage severity?"
        value={formData.damageSeverity}
        onChange={v => setField('damageSeverity', v as UserSituation['damageSeverity'])}
        options={[
          { value: 'minor', label: 'Minor (some damage, still livable/operational)' },
          { value: 'moderate', label: 'Moderate (significant damage, repairs needed)' },
          { value: 'severe', label: 'Severe (major damage, not livable/operational)' },
          { value: 'destroyed', label: 'Destroyed (total loss)' },
        ]}
      />

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="hasAppliedToFEMA"
            checked={formData.hasAppliedToFEMA === true}
            onChange={e => setField('hasAppliedToFEMA', e.target.checked)}
            className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] rounded focus:ring-[#b0673f] focus:ring-offset-2"
          />
          <span className="text-[1.05rem] font-medium text-[#2a201a]">
            Have you already applied for FEMA assistance?
          </span>
        </label>
      </div>
    </>
  );
}

function InsuranceCoverageFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <SelectField
        id="hadInsuranceAtDisaster"
        label="Did you have insurance when the disaster occurred?"
        value={formData.hadInsuranceAtDisaster}
        onChange={v => setField('hadInsuranceAtDisaster', v as UserSituation['hadInsuranceAtDisaster'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'unsure', label: 'Unsure' },
        ]}
      />

      <MultiSelectGroup
        label="What types of insurance did you have? Select all that apply."
        options={[
          'Homeowners insurance', 'Renters insurance', 'Flood insurance', 'Vehicle insurance',
          'Business property insurance', 'Business interruption insurance', 'Crop insurance', 'Livestock insurance',
          'Farm property insurance', 'Health insurance', 'Life or funeral insurance', 'Other', 'No insurance',
        ]}
        selected={multiValue(formData, 'insuranceTypesHeld')}
        onChange={next => setField('insuranceTypesHeld', next)}
      />

      <MultiSelectGroup
        label="Which damaged items or losses were covered by insurance?"
        options={[
          'Home or building', 'Personal belongings', 'Vehicle', 'Temporary housing', 'Business property',
          'Lost business income', 'Crops', 'Livestock', 'Medical expenses', 'Funeral expenses', 'Other', 'Unsure',
        ]}
        selected={multiValue(formData, 'insuranceCoveredItems')}
        onChange={next => setField('insuranceCoveredItems', next)}
      />
    </>
  );
}

function InsuranceClaimStatusFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <SelectField
        id="filedInsuranceClaimForDisaster"
        label="Have you filed an insurance claim for this disaster?"
        value={formData.filedInsuranceClaimForDisaster}
        onChange={v => setField('filedInsuranceClaimForDisaster', v as UserSituation['filedInsuranceClaimForDisaster'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'started_not_finished', label: 'I started but did not finish' },
          { value: 'unsure_how', label: 'I am unsure how to file' },
          { value: 'do_not_plan', label: 'I do not plan to file' },
        ]}
      />

      <SelectField
        id="insuranceClaimStatus"
        label="What is the current status of your claim?"
        value={formData.insuranceClaimStatus}
        onChange={v => setField('insuranceClaimStatus', v as UserSituation['insuranceClaimStatus'])}
        options={[
          { value: 'not_submitted', label: 'Not yet submitted' },
          { value: 'submitted_waiting', label: 'Submitted and waiting' },
          { value: 'inspection_scheduled', label: 'Inspection scheduled' },
          { value: 'inspection_completed', label: 'Inspection completed' },
          { value: 'more_docs_requested', label: 'More documents requested' },
          { value: 'partially_approved', label: 'Partially approved' },
          { value: 'fully_approved', label: 'Fully approved' },
          { value: 'denied', label: 'Denied' },
          { value: 'closed', label: 'Closed' },
          { value: 'unsure', label: 'Unsure' },
        ]}
      />

      <SelectField
        id="receivedSettlementLetter"
        label="Have you received an insurance decision or settlement letter?"
        value={formData.receivedSettlementLetter}
        onChange={v => setField('receivedSettlementLetter', v as UserSituation['receivedSettlementLetter'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'not_yet', label: 'Not yet' },
          { value: 'unsure', label: 'Unsure' },
        ]}
      />

      <SelectField
        id="insuranceCoveredAllLosses"
        label="Did insurance cover all of your disaster-related losses?"
        value={formData.insuranceCoveredAllLosses}
        onChange={v => setField('insuranceCoveredAllLosses', v as UserSituation['insuranceCoveredAllLosses'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'only_some', label: 'Only some losses' },
          { value: 'pending', label: 'The claim is still pending' },
          { value: 'unsure', label: 'Unsure' },
        ]}
      />

      <SelectField
        id="insurancePaymentAmount"
        label="Approximately how much did insurance pay or agree to pay?"
        value={formData.insurancePaymentAmount}
        onChange={v => setField('insurancePaymentAmount', v as UserSituation['insurancePaymentAmount'])}
        options={[
          { value: 'nothing', label: 'Nothing' },
          { value: 'lt_1000', label: 'Less than $1,000' },
          { value: '1000_5000', label: '$1,000–$5,000' },
          { value: '5001_25000', label: '$5,001–$25,000' },
          { value: '25001_100000', label: '$25,001–$100,000' },
          { value: 'gt_100000', label: 'More than $100,000' },
          { value: 'pending', label: 'Pending' },
          { value: 'prefer_not_to_say', label: 'Prefer not to answer' },
        ]}
      />

      <MultiSelectGroup
        label="Which needs remain unpaid after insurance? Select all that apply."
        options={[
          'Home repairs', 'Temporary housing', 'Personal belongings', 'Vehicle repair or replacement',
          'Medical expenses', 'Childcare', 'Business repairs', 'Business income loss', 'Agricultural losses',
          'Cleanup or debris removal', 'Road or bridge repair', 'Other',
        ]}
        selected={multiValue(formData, 'unpaidNeedsAfterInsurance')}
        onChange={next => setField('unpaidNeedsAfterInsurance', next)}
      />

      <SelectField
        id="claimPartiallyOrFullyDenied"
        label="Was any part of your insurance claim denied?"
        value={formData.claimPartiallyOrFullyDenied}
        onChange={v => setField('claimPartiallyOrFullyDenied', v as UserSituation['claimPartiallyOrFullyDenied'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'pending', label: 'Pending' },
        ]}
      />

      <SelectField
        id="claimDenialReason"
        label="Why was the claim denied or reduced?"
        value={formData.claimDenialReason}
        onChange={v => setField('claimDenialReason', v as UserSituation['claimDenialReason'])}
        options={[
          { value: 'not_covered', label: 'Damage was not covered' },
          { value: 'flood_related', label: 'Damage was considered flood-related' },
          { value: 'pre_existing', label: 'Damage was considered pre-existing' },
          { value: 'deductible_too_high', label: 'Deductible was too high' },
          { value: 'missing_documentation', label: 'Documentation was missing' },
          { value: 'policy_expired', label: 'Policy had expired' },
          { value: 'coverage_limit_reached', label: 'Coverage limit was reached' },
          { value: 'disputed_cause', label: 'Insurer disputed the cause of damage' },
          { value: 'other', label: 'Other' },
          { value: 'unsure', label: 'Unsure' },
        ]}
      />

      <SelectField
        id="wantsHelpWithInsuranceAppeal"
        label="Would you like help understanding or appealing an insurance decision?"
        value={formData.wantsHelpWithInsuranceAppeal}
        onChange={v => setField('wantsHelpWithInsuranceAppeal', v as UserSituation['wantsHelpWithInsuranceAppeal'])}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'maybe_later', label: 'Maybe later' },
        ]}
      />
    </>
  );
}

function InsuranceDocumentationFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <MultiSelectGroup
        label="Which of the following do you have?"
        options={[
          'Photographs', 'Videos', 'Repair estimates', 'Contractor invoices', 'Receipts', 'Insurance inspection',
          'FEMA inspection', 'Engineering report', 'Medical bills', 'Childcare receipts',
          'Business financial statements', 'Farm production records', 'Vehicle repair estimate', 'None yet',
        ]}
        selected={multiValue(formData, 'evidenceOfDamage')}
        onChange={next => setField('evidenceOfDamage', next)}
      />

      <MultiSelectGroup
        label="Have you already received help for any of these losses?"
        options={[
          'FEMA', 'Insurance', 'SBA', 'Red Cross', 'State assistance', 'County assistance',
          'Employer assistance', 'Church or nonprofit assistance', 'Crowdfunding or donations', 'No assistance yet',
        ]}
        selected={multiValue(formData, 'assistanceAlreadyReceived')}
        onChange={next => setField('assistanceAlreadyReceived', next)}
      />

      <MultiSelectGroup
        label="Which needs are still unpaid or unresolved?"
        options={[
          'Housing', 'Repairs', 'Personal property', 'Transportation', 'Childcare', 'Medical care',
          'Food', 'Utilities', 'Employment', 'Business losses', 'Agricultural losses', 'Legal help', 'Other',
        ]}
        selected={multiValue(formData, 'unresolvedNeeds')}
        onChange={next => setField('unresolvedNeeds', next)}
      />
    </>
  );
}

function InsuranceUrgentNeedFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="mostUrgentNeedDescription" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
          What is your most urgent unresolved need right now?
        </label>
        <input
          type="text"
          id="mostUrgentNeedDescription"
          name="mostUrgentNeedDescription"
          value={formData.mostUrgentNeedDescription || ''}
          onChange={e => setField('mostUrgentNeedDescription', e.target.value)}
          className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          placeholder="e.g., Safe temporary housing for my family"
        />
      </div>

      <MultiSelectGroup
        label="Which three needs should Aid Compass prioritize first?"
        options={[
          'Safe housing', 'Home repair', 'Food', 'Utilities', 'Transportation', 'Childcare', 'Medical care',
          'Employment', 'Business recovery', 'Farm recovery', 'Cleanup', 'Legal assistance',
          'Mental-health support', 'Document replacement', 'Other',
        ]}
        selected={multiValue(formData, 'priorityNeeds')}
        onChange={next => setField('priorityNeeds', next)}
        max={3}
      />
    </>
  );
}

type InsuranceGroupKey = 'overview' | 'coverage' | 'claim' | 'documentation' | 'urgentNeed';

const INSURANCE_GROUPS: { value: InsuranceGroupKey; label: string; fields: (keyof UserSituation)[] }[] = [
  { value: 'overview', label: 'Overview', fields: ['applyingForProgramId', 'damageSeverity', 'hasAppliedToFEMA'] },
  { value: 'coverage', label: 'A. Insurance Coverage', fields: ['hadInsuranceAtDisaster', 'insuranceTypesHeld', 'insuranceCoveredItems'] },
  {
    value: 'claim',
    label: 'B. Insurance Claim Status',
    fields: [
      'filedInsuranceClaimForDisaster', 'insuranceClaimStatus', 'receivedSettlementLetter', 'insuranceCoveredAllLosses',
      'insurancePaymentAmount', 'unpaidNeedsAfterInsurance', 'claimPartiallyOrFullyDenied', 'claimDenialReason', 'wantsHelpWithInsuranceAppeal',
    ],
  },
  { value: 'documentation', label: 'Documentation and Prior Assistance', fields: ['evidenceOfDamage', 'assistanceAlreadyReceived', 'unresolvedNeeds'] },
  { value: 'urgentNeed', label: 'Most Urgent Need', fields: ['mostUrgentNeedDescription', 'priorityNeeds'] },
];

const INSURANCE_GROUP_COMPONENTS: Record<InsuranceGroupKey, (props: FieldsProps) => React.JSX.Element> = {
  overview: InsuranceOverviewFields,
  coverage: InsuranceCoverageFields,
  claim: InsuranceClaimStatusFields,
  documentation: InsuranceDocumentationFields,
  urgentNeed: InsuranceUrgentNeedFields,
};

function InsuranceRecoveryFields({ formData, setField }: FieldsProps) {
  // Unlike the Damage/Needs section, every group here is always relevant —
  // there's no primary/secondary picker, just a fixed list to page through.
  const [activeGroup, setActiveGroup] = useState<InsuranceGroupKey>('overview');
  const ActiveComponent = INSURANCE_GROUP_COMPONENTS[activeGroup];
  const activeMeta = INSURANCE_GROUPS.find(g => g.value === activeGroup)!;

  return (
    <div className="flex gap-8 items-start">
      <div className="flex-1 min-w-0 space-y-6">
        <div className="border-b border-[#e4d9cf] pb-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#895031] mb-1.5">
            You&apos;re answering
          </p>
          <h3 className="font-serif text-[1.4rem] font-medium text-[#1f1610]">
            {activeMeta.label}
          </h3>
        </div>

        <ActiveComponent formData={formData} setField={setField} />
      </div>

      {/* Fixed checklist — same visual language as the Damage/Needs
          checklist, but every group is always present since none of these
          depend on the user's profile. */}
      <aside className="w-64 flex-none rounded-[14px] border border-[#e4d9cf] bg-[#faf6f1] p-5 sticky top-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#895031] mb-4">
          Sections
        </p>
        <div className="space-y-1.5">
          {INSURANCE_GROUPS.map(group => {
            const done = areFieldsAnswered(formData, group.fields);
            const isActive = activeGroup === group.value;
            return (
              <button
                key={group.value}
                type="button"
                onClick={() => setActiveGroup(group.value)}
                className={`w-full flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-left text-[0.85rem] transition-colors ${
                  isActive ? 'bg-white text-[#1f1610] font-bold' : 'text-[#1f1610] hover:bg-white'
                }`}
              >
                <span
                  className={`flex h-4 w-4 flex-none items-center justify-center rounded-full border text-[0.6rem] text-white ${checklistCircleClass(done, isActive)}`}
                  aria-hidden="true"
                >
                  {done && !isActive ? '✓' : ''}
                </span>
                <span className="flex-1">{group.label}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
