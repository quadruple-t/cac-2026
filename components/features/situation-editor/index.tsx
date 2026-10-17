'use client';

import { useState } from 'react';
import { UserSituation } from '@/lib/aid-programs';

// The same 8 core fields the chatbot gathers (see conversational-intake).
type CoreSituation = Pick<
  UserSituation,
  | 'county'
  | 'damageType'
  | 'ownershipStatus'
  | 'damageSeverity'
  | 'hasInsurance'
  | 'isFarmer'
  | 'incomeRange'
  | 'hasAppliedToFEMA'
>;

type SelectField = {
  key: 'damageType' | 'ownershipStatus' | 'damageSeverity' | 'incomeRange';
  label: string;
  options: { value: string; label: string }[];
};

type YesNoField = {
  key: 'hasInsurance' | 'isFarmer' | 'hasAppliedToFEMA';
  label: string;
};

const SELECT_FIELDS: SelectField[] = [
  {
    key: 'damageType',
    label: 'What was damaged?',
    options: [
      { value: 'home', label: 'Home' },
      { value: 'business', label: 'Business' },
      { value: 'both', label: 'Both' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'ownershipStatus',
    label: 'Do you own or rent?',
    options: [
      { value: 'owner', label: 'Own' },
      { value: 'renter', label: 'Rent' },
      { value: 'both', label: 'Both' },
    ],
  },
  {
    key: 'damageSeverity',
    label: 'How bad was the damage?',
    options: [
      { value: 'minor', label: 'Minor' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'severe', label: 'Severe' },
      { value: 'destroyed', label: 'Destroyed' },
    ],
  },
  {
    key: 'incomeRange',
    label: 'Household income',
    options: [
      { value: 'low', label: 'Under $50k' },
      { value: 'medium', label: '$50k to $100k' },
      { value: 'high', label: 'Over $100k' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
  },
];

const YES_NO_FIELDS: YesNoField[] = [
  { key: 'hasInsurance', label: 'Do you have insurance coverage?' },
  { key: 'isFarmer', label: 'Do you farm or own agricultural land?' },
  { key: 'hasAppliedToFEMA', label: 'Have you applied to FEMA?' },
];

const inputClass =
  'w-full px-3 py-2 border border-[#e4d9cf] rounded-[10px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white disabled:opacity-50';

interface SituationEditorProps {
  situation: Partial<UserSituation> | null;
  /** Saves only the changed fields. Resolves true on success. */
  onSave: (patch: Partial<UserSituation>) => Promise<boolean>;
}

const toDraft = (situation: Partial<UserSituation> | null): Partial<CoreSituation> => ({
  county: situation?.county,
  damageType: situation?.damageType,
  ownershipStatus: situation?.ownershipStatus,
  damageSeverity: situation?.damageSeverity,
  hasInsurance: situation?.hasInsurance,
  isFarmer: situation?.isFarmer,
  incomeRange: situation?.incomeRange,
  hasAppliedToFEMA: situation?.hasAppliedToFEMA,
});

export default function SituationEditor({ situation, onSave }: SituationEditorProps) {
  const [draft, setDraft] = useState<Partial<CoreSituation>>(() => toDraft(situation));
  // Re-sync when the saved situation changes elsewhere (e.g. an AI correction
  // is applied), so a later save doesn't write stale values back over it.
  const [syncedSituation, setSyncedSituation] = useState(situation);
  if (situation !== syncedSituation) {
    setSyncedSituation(situation);
    setDraft(toDraft(situation));
  }
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const update = (patch: Partial<CoreSituation>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only send fields that actually changed. A field set back to
    // "Not answered" (or an emptied county) is sent as null, which clears it.
    const patch: Record<string, unknown> = {};
    (Object.keys(draft) as (keyof CoreSituation)[]).forEach((key) => {
      const raw = draft[key];
      const value = typeof raw === 'string' ? raw.trim() || undefined : raw;
      const saved = situation?.[key] ?? undefined;
      if (value === saved) return;
      patch[key] = value === undefined ? null : value;
    });
    if (Object.keys(patch).length === 0) return;

    setIsSaving(true);
    const ok = await onSave(patch as Partial<UserSituation>);
    setStatus(ok ? 'saved' : 'error');
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-[#1f1610]">County</span>
        <input
          type="text"
          value={draft.county ?? ''}
          onChange={(e) => update({ county: e.target.value })}
          placeholder="e.g. Buncombe County"
          disabled={isSaving}
          className={inputClass}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        {SELECT_FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-1 block text-sm font-medium text-[#1f1610]">{field.label}</span>
            <select
              value={draft[field.key] ?? ''}
              onChange={(e) => update({ [field.key]: e.target.value || undefined } as Partial<CoreSituation>)}
              disabled={isSaving}
              className={inputClass}
            >
              <option value="">Not answered</option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        {YES_NO_FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-1 block text-sm font-medium text-[#1f1610]">{field.label}</span>
            <select
              value={draft[field.key] === undefined ? '' : draft[field.key] ? 'yes' : 'no'}
              onChange={(e) =>
                update({ [field.key]: e.target.value === '' ? undefined : e.target.value === 'yes' } as Partial<CoreSituation>)
              }
              disabled={isSaving}
              className={inputClass}
            >
              <option value="">Not answered</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#3d2b20] text-white rounded-[10px] px-6 py-3 font-semibold hover:bg-[#2b1e15] transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
        {status === 'saved' && <p role="status" className="text-sm text-[#168260]">Saved.</p>}
        {status === 'error' && <p role="alert" className="text-sm text-[#a33a2a]">Couldn&apos;t save. Please try again.</p>}
      </div>
    </form>
  );
}
