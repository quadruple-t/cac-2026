'use client';

import { useState } from 'react';
import { UserSituation } from '@/lib/aid-programs';

interface AidIntakeFormProps {
  onSubmit: (situation: UserSituation) => void;
}

type SectionId = 'location' | 'applicantType' | 'assistanceType' | 'disasterEvent';

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
    fields: ['county'],
  },
  {
    id: 'applicantType',
    number: 2,
    title: 'Applicant Type',
    description: 'Who is applying for assistance.',
    fields: ['ownershipStatus', 'isFarmer', 'incomeRange'],
  },
  {
    id: 'assistanceType',
    number: 3,
    title: 'Type of Assistance Needed',
    description: "What kind of help you're looking for.",
    fields: ['damageType', 'hasInsurance'],
  },
  {
    id: 'disasterEvent',
    number: 4,
    title: 'Disaster or Triggering Event',
    description: 'What happened, and where you are in the process.',
    fields: ['damageSeverity', 'hasAppliedToFEMA'],
  },
];

export default function AidIntakeForm({ onSubmit }: AidIntakeFormProps) {
  const [formData, setFormData] = useState<Partial<UserSituation>>({});
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
                  {section.id === 'assistanceType' && (
                    <AssistanceTypeFields formData={formData} setField={setField} />
                  )}
                  {section.id === 'disasterEvent' && (
                    <DisasterEventFields formData={formData} setField={setField} />
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
          Find My Eligible Programs
        </button>
      </form>
    </div>
  );
}

interface FieldsProps {
  formData: Partial<UserSituation>;
  setField: <K extends keyof UserSituation>(field: K, value: UserSituation[K]) => void;
}

function LocationFields({ formData, setField }: FieldsProps) {
  return (
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
  );
}

function ApplicantTypeFields({ formData, setField }: FieldsProps) {
  return (
    <>
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

function AssistanceTypeFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="damageType" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
          What type of property was damaged?
        </label>
        <select
          id="damageType"
          name="damageType"
          value={formData.damageType || ''}
          onChange={e => setField('damageType', e.target.value as UserSituation['damageType'])}
          className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
        >
          <option value="">Prefer not to say</option>
          <option value="home">Home</option>
          <option value="business">Business</option>
          <option value="both">Both home and business</option>
          <option value="other">Other</option>
        </select>
      </div>

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

function DisasterEventFields({ formData, setField }: FieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="damageSeverity" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
          How would you describe the damage severity?
        </label>
        <select
          id="damageSeverity"
          name="damageSeverity"
          value={formData.damageSeverity || ''}
          onChange={e => setField('damageSeverity', e.target.value as UserSituation['damageSeverity'])}
          className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
        >
          <option value="">Prefer not to say</option>
          <option value="minor">Minor (some damage, still livable/operational)</option>
          <option value="moderate">Moderate (significant damage, repairs needed)</option>
          <option value="severe">Severe (major damage, not livable/operational)</option>
          <option value="destroyed">Destroyed (total loss)</option>
        </select>
      </div>

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
