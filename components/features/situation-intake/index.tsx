'use client';

import { useState } from 'react';
import { UserSituation } from '@/lib/document-requirements';

interface SituationIntakeProps {
  onSubmit: (situation: UserSituation) => void;
}

export default function SituationIntake({ onSubmit }: SituationIntakeProps) {
  const [formData, setFormData] = useState<Partial<UserSituation>>({
    county: '',
    damageType: undefined,
    ownershipStatus: undefined,
    hasInsurance: false,
    incomeRange: undefined,
    isFarmer: false,
    hasAppliedToFEMA: false,
    damageSeverity: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidForm()) {
      onSubmit(formData as UserSituation);
    }
  };

  const isValidForm = () => {
    return (
      formData.county &&
      formData.damageType &&
      formData.ownershipStatus &&
      formData.incomeRange &&
      formData.damageSeverity !== undefined
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
        Tell Us About Your Situation
      </h2>
      <p className="text-[#6b5a4e] mb-[34px] text-[1.05rem] leading-relaxed">
        We'll use this information to create a personalized document checklist for the aid programs you qualify for.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* County */}
        <div>
          <label htmlFor="county" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
            What county are you in? <span className="text-[#b0673f]">*</span>
          </label>
          <input
            type="text"
            id="county"
            name="county"
            value={formData.county}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
            placeholder="e.g., Buncombe County"
          />
        </div>

        {/* Damage Type */}
        <div>
          <label htmlFor="damageType" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
            What type of property was damaged? <span className="text-[#b0673f]">*</span>
          </label>
          <select
            id="damageType"
            name="damageType"
            value={formData.damageType || ''}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          >
            <option value="">Select an option</option>
            <option value="home">Home</option>
            <option value="business">Business</option>
            <option value="both">Both home and business</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Ownership Status */}
        <div>
          <label htmlFor="ownershipStatus" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
            Do you own or rent? <span className="text-[#b0673f]">*</span>
          </label>
          <select
            id="ownershipStatus"
            name="ownershipStatus"
            value={formData.ownershipStatus || ''}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          >
            <option value="">Select an option</option>
            <option value="owner">Owner</option>
            <option value="renter">Renter</option>
            <option value="both">Both owner and renter</option>
          </select>
        </div>

        {/* Insurance */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="hasInsurance"
              checked={formData.hasInsurance}
              onChange={handleChange}
              className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] rounded focus:ring-[#b0673f] focus:ring-offset-2"
            />
            <span className="text-[1.05rem] font-medium text-[#2a201a]">
              Do you have insurance (homeowners, renters, flood, or business)?
            </span>
          </label>
        </div>

        {/* Income Range */}
        <div>
          <label htmlFor="incomeRange" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
            What is your household income range? <span className="text-[#b0673f]">*</span>
          </label>
          <select
            id="incomeRange"
            name="incomeRange"
            value={formData.incomeRange || ''}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          >
            <option value="">Select an option</option>
            <option value="low">Under $50,000</option>
            <option value="medium">$50,000 - $100,000</option>
            <option value="high">Over $100,000</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        {/* Farmer */}
        <div>
          <label htmlFor="isFarmer" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
            Are you a farmer or do you own agricultural land? <span className="text-[#b0673f]">*</span>
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="isFarmer"
                value="true"
                checked={formData.isFarmer === true}
                onChange={() => setFormData(prev => ({ ...prev, isFarmer: true }))}
                className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] focus:ring-[#b0673f]"
              />
              <span className="text-[1.05rem] text-[#2a201a]">Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="isFarmer"
                value="false"
                checked={formData.isFarmer === false}
                onChange={() => setFormData(prev => ({ ...prev, isFarmer: false }))}
                className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] focus:ring-[#b0673f]"
              />
              <span className="text-[1.05rem] text-[#2a201a]">No</span>
            </label>
          </div>
        </div>

        {/* FEMA Application */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="hasAppliedToFEMA"
              checked={formData.hasAppliedToFEMA}
              onChange={handleChange}
              className="w-5 h-5 text-[#b0673f] border-[#e4d9cf] rounded focus:ring-[#b0673f] focus:ring-offset-2"
            />
            <span className="text-[1.05rem] font-medium text-[#2a201a]">
              Have you already applied for FEMA assistance?
            </span>
          </label>
        </div>

        {/* Damage Severity */}
        <div>
          <label htmlFor="damageSeverity" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
            How would you describe the damage severity? <span className="text-[#b0673f]">*</span>
          </label>
          <select
            id="damageSeverity"
            name="damageSeverity"
            value={formData.damageSeverity || ''}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          >
            <option value="">Select an option</option>
            <option value="minor">Minor (some damage, still livable/operational)</option>
            <option value="moderate">Moderate (significant damage, repairs needed)</option>
            <option value="severe">Severe (major damage, not livable/operational)</option>
            <option value="destroyed">Destroyed (total loss)</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValidForm()}
          className="w-full bg-[#3d2b20] text-white py-3.5 px-6 rounded-[10px] font-semibold text-[1.05rem] hover:bg-[#2b1e15] focus:ring-2 focus:ring-[#b0673f] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Generate My Document Checklist
        </button>
      </form>
    </div>
  );
}
