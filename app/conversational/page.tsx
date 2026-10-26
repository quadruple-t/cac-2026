'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/use-auth';
import Navigation from '@/components/navigation';
import ConversationalIntake from '@/components/features/conversational-intake';
import AidDashboard from '@/components/features/aid-dashboard';
import { UserSituation, AidProgram } from '@/lib/aid-programs';
import { rankedProgramToAidProgram } from '@/lib/sheets/aid-programs-adapter';
import {
  clearPendingSituation,
  persistIntakeSituation,
  readPendingSituation,
} from '@/lib/user-situation-client';

export default function ConversationalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userSituation, setUserSituation] = useState<UserSituation | null>(null);
  const [eligiblePrograms, setEligiblePrograms] = useState<AidProgram[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  // Matches against the real Google Sheet program database via /api/aid-programs
  // — same source signed-in users get from the Dashboard — regardless of sign-in
  // state, instead of the stale hardcoded list in lib/aid-programs.ts.
  const showInlineResults = async (situation: UserSituation) => {
    setUserSituation(situation);
    setIsMatching(true);
    try {
      const res = await fetch('/api/aid-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(situation),
      });
      if (res.ok) {
        const data = await res.json();
        setEligiblePrograms(data.programs.map(rankedProgramToAidProgram));
      } else {
        const errorData = await res.json();
        console.error('Failed to load aid programs:', res.status, errorData);
        setEligiblePrograms([]);
      }
    } catch (error) {
      console.error('Error loading aid programs:', error);
      setEligiblePrograms([]);
    } finally {
      setIsMatching(false);
    }
  };

  // Signed-out visitors who chatted via the floating widget land here with
  // their answers stashed locally; show them the results they asked for.
  useEffect(() => {
    if (loading || user) return;
    const pending = readPendingSituation();
    if (!pending) return;
    // Deferred so state isn't set synchronously inside the effect body.
    const timer = setTimeout(() => { void showInlineResults(pending as UserSituation); }, 0);
    return () => clearTimeout(timer);
  }, [loading, user]);

  const handleIntakeComplete = async (situation: UserSituation) => {
    // Signed in: save to the account so Programs and Deadlines use these answers.
    const outcome = await persistIntakeSituation(situation);
    if (outcome === 'saved') {
      router.push('/programs');
      return;
    }
    // Signed out (or save failed): show results inline; answers stay stashed
    // locally and are saved once the user signs in.
    await showInlineResults(situation);
  };

  const handleReset = () => {
    setUserSituation(null);
    setEligiblePrograms([]);
    clearPendingSituation();
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
          ) : isMatching ? (
            <div className="text-center py-12">
              <p className="text-[#6b5a4e]">Finding programs that may fit...</p>
            </div>
          ) : (
            <div>
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
