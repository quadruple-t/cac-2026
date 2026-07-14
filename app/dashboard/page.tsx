'use client';

/**
 * Aid Dashboard page ("Disaster Aid Center").
 *
 * This is the main authenticated hub of Aid Compass. It has two jobs:
 *   1. Collect a "situation" from the user (county, damage type, ownership,
 *      income, etc.) via a short intake form.
 *   2. Once a situation exists, show the user two tabs built from that same
 *      situation: the list of aid programs they're eligible for, and a
 *      personalized document checklist for applying to those programs.
 *
 * The user's situation is persisted to localStorage (not a database) so it
 * can be shared across this page, the Deadline Tracker, and the standalone
 * Document Checklist page without re-asking the same questions.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/use-auth';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import AidDashboard from '@/components/features/aid-dashboard';
import { getEligiblePrograms, rankProgramsByUrgency, UserSituation, AidProgram } from '@/lib/aid-programs';

export default function DashboardPage() {
  // Firebase auth state. `loading` is true until Firebase has resolved
  // whether a user is signed in; `user` is null when signed out.
  const { user, loading } = useAuth();
  const router = useRouter();

  // The user's answers from the intake form (county, damage type, etc.).
  // Null until they've submitted the form at least once (this session or a
  // previous one, via localStorage).
  const [userSituation, setUserSituation] = useState<UserSituation | null>(null);

  // Aid programs the current situation qualifies for, pre-sorted so the
  // most time-sensitive deadlines surface first. Derived from
  // `userSituation` any time it changes (see handlers below).
  const [eligiblePrograms, setEligiblePrograms] = useState<AidProgram[]>([]);

  // Local "is this page ready to render" flag, separate from Firebase's own
  // `loading`. Covers the synchronous localStorage read below so we don't
  // flash the intake form for a split second before swapping to the
  // dashboard/checklist view.
  const [isLoading, setIsLoading] = useState(true);
<<<<<<< HEAD
=======

  // Which of the two result tabs is currently visible once a situation
  // exists: the matched aid programs, or the generated document checklist.
  const [activeTab, setActiveTab] = useState<'programs' | 'documents'>('programs');
>>>>>>> d7e08cee755b294127ca92608c7235a6f9ac7827

  useEffect(() => {
    // Route guard: bounce anonymous visitors to sign-in once Firebase has
    // finished checking auth state. (Also enforced server-side by the
    // proxy/middleware, but this handles the client-rendered case too.)
    if (!loading && !user) {
      router.push('/sign-in');
      return;
    }

    // Rehydrate a previously-submitted situation from localStorage, if any,
    // so returning users don't have to redo the intake form. This is the
    // same storage key the Document Generator and Deadline Tracker pages
    // read/write, which is how a situation entered on one page shows up on
    // the others.
    const savedSituation = localStorage.getItem('userSituation');
    if (savedSituation) {
      try {
        const parsedSituation = JSON.parse(savedSituation);
        setUserSituation(parsedSituation);
        // Recompute eligible programs from the restored situation, ranked
        // so the most urgent deadlines appear first.
        const eligible = getEligiblePrograms(parsedSituation);
        const ranked = rankProgramsByUrgency(eligible);
        setEligiblePrograms(ranked);
      } catch (error) {
        // Malformed/corrupt localStorage value — log and fall back to
        // showing the intake form instead of crashing the page.
        console.error('Error parsing saved situation:', error);
      }
    }
    setIsLoading(false);
  }, [user, loading, router]);

  /** Called when the intake form (QuickIntakeForm below) is submitted. */
  const handleFormSubmit = (situation: UserSituation) => {
    setUserSituation(situation);
    // Persist so the Document Generator and Deadline Tracker pages can pick
    // up the same situation without asking the user again.
    localStorage.setItem('userSituation', JSON.stringify(situation));
    const eligible = getEligiblePrograms(situation);
    const ranked = rankProgramsByUrgency(eligible);
    setEligiblePrograms(ranked);
  };

  /** "Start Over" — clears the situation and returns the user to the intake form. */
  const handleReset = () => {
    setUserSituation(null);
    setEligiblePrograms([]);
    localStorage.removeItem('userSituation');
  };

  // While Firebase auth is still resolving, or while we're checking
  // localStorage for a saved situation, show a minimal loading state rather
  // than the intake form (which would otherwise flash briefly).
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
          {/* Header — always visible, regardless of which step the user is on. */}
          <div className="mb-[34px] text-center">
            <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
              Disaster Aid Center
            </p>
            <h1 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
              Your Personalized Aid Resources
            </h1>
            <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] leading-relaxed max-w-2xl mx-auto">
              Answer a few questions about your situation to discover eligible aid programs.
            </p>
          </div>

          {/* Main Content:
              - No situation yet -> show the intake form.
              - Situation exists -> show the tabbed programs/documents view. */}
          {!userSituation ? (
            <QuickIntakeForm onSubmit={handleFormSubmit} />
          ) : (
            <div>
<<<<<<< HEAD
              <AidDashboard programs={eligiblePrograms} userSituation={userSituation} />
=======
              {/* Tab Navigation — switches between the two views built from
                  the same `userSituation`/`eligiblePrograms` data. */}
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

              {/* Tab Content.
                  Note: `generateDocumentChecklist` is recomputed here (and
                  again in the tab label above) rather than cached in state,
                  since it's a pure/cheap derivation from `userSituation`. */}
              {activeTab === 'programs' ? (
                <AidDashboard programs={eligiblePrograms} userSituation={userSituation} />
              ) : (
                <DocumentChecklist
                  documents={generateDocumentChecklist(userSituation)}
                  onReset={handleReset}
                />
              )}
>>>>>>> d7e08cee755b294127ca92608c7235a6f9ac7827

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
  /** Called with the fully-filled-out situation once the form is submitted. */
  onSubmit: (situation: UserSituation) => void;
}

/**
 * Short intake form collecting the handful of facts (county, damage type,
 * ownership, severity, insurance, farm status, income range, prior FEMA
 * application) needed to match the user against aid program eligibility
 * rules in `lib/aid-programs`.
 */
function QuickIntakeForm({ onSubmit }: QuickIntakeFormProps) {
  // All form fields live in a single object so `handleChange` can update
  // any of them generically by `name` rather than needing one setter per field.
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

  /**
   * Generic change handler shared by every text/select/checkbox input below.
   * Reads `name`/`value`/`type` off the event target so one function can
   * back the whole form instead of one handler per field.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      // Checkboxes report their state via `.checked`, everything else via `.value`.
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
        {/* County — free text, used for regional program eligibility. */}
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

        {/* Damage Type — home vs. business vs. both; affects which programs apply. */}
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

        {/* Ownership Status — owner/renter status affects eligibility for some programs. */}
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

        {/* Damage Severity — feeds urgency ranking and which programs are worth showing. */}
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

        {/* Insurance — a simple boolean checkbox, handled by the shared handleChange. */}
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

        {/* Farmer — a radio pair rather than a checkbox because "isFarmer" needs an
            explicit true/false answer (not just "checked" vs. "not yet answered"),
            so it's set directly via setFormData instead of the generic handleChange. */}
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

        {/* Income Range — used for income-capped programs (e.g. some grants/loans). */}
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

        {/* FEMA Application — whether they've already applied, which changes
            which next steps/programs are relevant (e.g. appeal vs. first application). */}
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

        {/* Submit — hands the completed formData back to the parent via onSubmit. */}
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
