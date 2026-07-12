'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/use-auth';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import AidDashboard from '@/components/features/aid-dashboard';
import DocumentChecklist from '@/components/features/document-checklist';
import { getEligiblePrograms, rankProgramsByUrgency, UserSituation, AidProgram } from '@/lib/aid-programs';
import { generateDocumentChecklist } from '@/lib/document-requirements';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userSituation, setUserSituation] = useState<UserSituation | null>(null);
  const [eligiblePrograms, setEligiblePrograms] = useState<AidProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'programs' | 'documents'>('programs');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
      return;
    }

    // Check for saved user situation
    const savedSituation = localStorage.getItem('userSituation');
    if (savedSituation) {
      try {
        const parsedSituation = JSON.parse(savedSituation);
        setUserSituation(parsedSituation);
        const eligible = getEligiblePrograms(parsedSituation);
        const ranked = rankProgramsByUrgency(eligible);
        setEligiblePrograms(ranked);
      } catch (error) {
        console.error('Error parsing saved situation:', error);
      }
    }
    setIsLoading(false);
  }, [user, loading, router]);

  const handleFormSubmit = (situation: UserSituation) => {
    setUserSituation(situation);
    localStorage.setItem('userSituation', JSON.stringify(situation));
    const eligible = getEligiblePrograms(situation);
    const ranked = rankProgramsByUrgency(eligible);
    setEligiblePrograms(ranked);
  };

  const handleReset = () => {
    setUserSituation(null);
    setEligiblePrograms([]);
    localStorage.removeItem('userSituation');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
        <Navigation />
        <main className="flex-1">
          <div className="text-center py-12">
            <p className="text-[#6b5a4e]">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation />

      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-[22px] py-[66px]">
          {/* Header */}
          <div className="mb-[34px] text-center">
            <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
              Disaster Aid Center
            </p>
            <h1 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
              Your Personalized Aid Resources
            </h1>
            <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] leading-relaxed max-w-2xl mx-auto">
              Answer a few questions about your situation to discover eligible aid programs and get a personalized document checklist for your applications.
            </p>
          </div>

          {/* Main Content */}
          {!userSituation ? (
            <QuickIntakeForm onSubmit={handleFormSubmit} />
          ) : (
            <div>
              {/* Tab Navigation */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex bg-white border border-[#e4d9cf] rounded-[14px] p-1">
                  <button
                    onClick={() => setActiveTab('programs')}
                    className={`px-6 py-3 rounded-[10px] font-medium text-[1.05rem] transition-colors ${
                      activeTab === 'programs'
                        ? 'bg-[#b0673f] text-white'
                        : 'text-[#6b5a4e] hover:text-[#2a201a]'
                    }`}
                  >
                    Aid Programs ({eligiblePrograms.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-6 py-3 rounded-[10px] font-medium text-[1.05rem] transition-colors ${
                      activeTab === 'documents'
                        ? 'bg-[#b0673f] text-white'
                        : 'text-[#6b5a4e] hover:text-[#2a201a]'
                    }`}
                  >
                    Document Checklist ({generateDocumentChecklist(userSituation).length})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'programs' ? (
                <AidDashboard programs={eligiblePrograms} userSituation={userSituation} />
              ) : (
                <DocumentChecklist
                  documents={generateDocumentChecklist(userSituation)}
                  onReset={handleReset}
                />
              )}

              <div className="text-center mt-8">
                <button
                  onClick={handleReset}
                  className="text-[#895031] hover:text-[#6b5a4e] font-medium text-sm"
                >
                  ← Start Over
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

interface QuickIntakeFormProps {
  onSubmit: (situation: UserSituation) => void;
}

function QuickIntakeForm({ onSubmit }: QuickIntakeFormProps) {
  const [formData, setFormData] = useState<UserSituation>({
    county: '',
    damageType: 'home',
    ownershipStatus: 'owner',
    hasInsurance: false,
    incomeRange: 'prefer_not_to_say',
    isFarmer: false,
    hasAppliedToFEMA: false,
    damageSeverity: 'moderate'
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
        Tell Us About Your Situation
      </h2>
      <p className="text-[#6b5a4e] mb-[34px] text-[1.05rem] leading-relaxed">
        We'll use this information to match you with the right aid programs.
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
            value={formData.damageType}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          >
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
            value={formData.ownershipStatus}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          >
            <option value="owner">Owner</option>
            <option value="renter">Renter</option>
            <option value="both">Both owner and renter</option>
          </select>
        </div>

        {/* Damage Severity */}
        <div>
          <label htmlFor="damageSeverity" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
            How would you describe the damage severity? <span className="text-[#b0673f]">*</span>
          </label>
          <select
            id="damageSeverity"
            name="damageSeverity"
            value={formData.damageSeverity}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          >
            <option value="minor">Minor (some damage, still livable/operational)</option>
            <option value="moderate">Moderate (significant damage, repairs needed)</option>
            <option value="severe">Severe (major damage, not livable/operational)</option>
            <option value="destroyed">Destroyed (total loss)</option>
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
              <span className="text-[1.05rem] font-medium text-[#2a201a]">Yes</span>
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
              <span className="text-[1.05rem] font-medium text-[#2a201a]">No</span>
            </label>
          </div>
        </div>

        {/* Income Range */}
        <div>
          <label htmlFor="incomeRange" className="block text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031] mb-2.5">
            What is your household income range? <span className="text-[#b0673f]">*</span>
          </label>
          <select
            id="incomeRange"
            name="incomeRange"
            value={formData.incomeRange}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white text-[1.05rem] transition-shadow"
          >
            <option value="low">Under $50,000</option>
            <option value="medium">$50,000 - $100,000</option>
            <option value="high">Over $100,000</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
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

        {/* Submit Button */}
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
