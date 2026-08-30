'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/firebase/use-auth';
import Navigation from '@/components/navigation';
import ConversationalIntake from '@/components/features/conversational-intake';
import AidDashboard from '@/components/features/aid-dashboard';
import { getEligiblePrograms, rankProgramsByUrgency, UserSituation, AidProgram } from '@/lib/aid-programs';

export default function ConversationalPage() {
  const { user, loading } = useAuth();
  const [userSituation, setUserSituation] = useState<UserSituation | null>(null);
  const [eligiblePrograms, setEligiblePrograms] = useState<AidProgram[]>([]);

  const handleIntakeComplete = (situation: UserSituation) => {
    setUserSituation(situation);
    // Save to localStorage for use in other pages
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

  if (loading) {
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
          {!userSituation ? (
            <ConversationalIntake onComplete={handleIntakeComplete} />
          ) : (
            <div>
              <div className="text-center mb-8">
                <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
                  Your Results
                </p>
                <h1 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
                  Programs That May Fit
                </h1>
                <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] max-w-2xl mx-auto">
                  Based on what you shared about {userSituation.county}, here are {eligiblePrograms.length} programs to explore.
                </p>
              </div>

              <AidDashboard programs={eligiblePrograms} userSituation={userSituation} />

              {!user && (
                <div className="mx-auto mt-8 max-w-2xl rounded-[14px] border border-[#d8b9a4] bg-[#fffaf5] p-5 text-center">
                  <h2 className="text-[1.2rem] font-bold text-[#1f1610]">Want to save your results?</h2>
                  <p className="mt-2 text-[1rem] text-[#55483d]">Create a free account to keep your programs and deadlines in one place.</p>
                  <a href="/sign-up?next=/dashboard" className="mt-4 inline-block rounded-lg bg-[#b0673f] px-5 py-3 text-[1rem] font-bold text-white no-underline hover:bg-[#895031]">Create a free account</a>
                </div>
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
