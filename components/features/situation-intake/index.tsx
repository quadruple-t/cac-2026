'use client';

import { useState } from 'react';
import { UserSituation } from '@/lib/document-requirements';

const NC_COUNTIES = [
  'Alamance', 'Alexander', 'Alleghany', 'Anson', 'Ashe', 'Avery', 'Beaufort',
  'Bertie', 'Bladen', 'Brunswick', 'Buncombe', 'Burke', 'Cabarrus', 'Caldwell',
  'Camden', 'Carteret', 'Caswell', 'Catawba', 'Chatham', 'Cherokee', 'Chowan',
  'Clay', 'Cleveland', 'Columbus', 'Craven', 'Cumberland', 'Currituck', 'Dare',
  'Davidson', 'Davie', 'Duplin', 'Durham', 'Edgecombe', 'Forsyth', 'Franklin',
  'Gaston', 'Gates', 'Graham', 'Granville', 'Greene', 'Guilford', 'Halifax',
  'Harnett', 'Haywood', 'Henderson', 'Hertford', 'Hoke', 'Hyde', 'Iredell',
  'Jackson', 'Johnston', 'Jones', 'Lee', 'Lenoir', 'Lincoln', 'Macon',
  'Madison', 'Martin', 'McDowell', 'Mecklenburg', 'Mitchell', 'Montgomery',
  'Moore', 'Nash', 'New Hanover', 'Northampton', 'Onslow', 'Orange', 'Pamlico',
  'Pasquotank', 'Pender', 'Perquimans', 'Person', 'Pitt', 'Polk', 'Randolph',
  'Richmond', 'Robeson', 'Rockingham', 'Rowan', 'Rutherford', 'Sampson',
  'Scotland', 'Stanly', 'Stokes', 'Surry', 'Swain', 'Transylvania', 'Tyrrell',
  'Union', 'Vance', 'Wake', 'Warren', 'Washington', 'Watauga', 'Wayne',
  'Wilkes', 'Wilson', 'Yadkin', 'Yancey',
];

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
    onSubmit(formData as UserSituation);
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

  const countyQuery = formData.county ?? '';
  const countyMatches = countyQuery
    ? NC_COUNTIES.filter(county => county.toLowerCase().startsWith(countyQuery.toLowerCase()))
    : [];

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
            What county are you in?
          </label>
          <div className="flex items-start gap-4">
            <input
              type="text"
              id="county"
              name="county"
              value={formData.county}
              onChange={handleChange}
              autoComplete="off"
              placeholder="Start typing a county…"
              className="flex-1 px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
            />
            {countyMatches.length > 0 && (
              <ul className="w-56 max-h-[220px] overflow-y-auto border border-[#e4d9cf] rounded-[14px] bg-white p-1.5 space-y-0.5">
                {countyMatches.map((county) => (
                  <li key={county}>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, county }))}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-[0.95rem] text-[#1f1610] hover:bg-[#f2ece5]"
                    >
                      {county}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Damage Type */}
        <div>
          <label htmlFor="damageType" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
            What type of property was damaged?
          </label>
          <select
            id="damageType"
            name="damageType"
            value={formData.damageType || ''}
            onChange={handleChange}
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
            Do you own or rent?
          </label>
          <select
            id="ownershipStatus"
            name="ownershipStatus"
            value={formData.ownershipStatus || ''}
            onChange={handleChange}
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
            What is your household income range?
          </label>
          <select
            id="incomeRange"
            name="incomeRange"
            value={formData.incomeRange || ''}
            onChange={handleChange}
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
            Are you a farmer or do you own agricultural land?
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
            How would you describe the damage severity?
          </label>
          <select
            id="damageSeverity"
            name="damageSeverity"
            value={formData.damageSeverity || ''}
            onChange={handleChange}
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
          className="w-full bg-[#3d2b20] text-white py-3.5 px-6 rounded-[10px] font-semibold text-[1.05rem] hover:bg-[#2b1e15] focus:ring-2 focus:ring-[#b0673f] focus:ring-offset-2 transition-colors"
        >
          Generate My Document Checklist
        </button>
      </form>
    </div>
  );
}
