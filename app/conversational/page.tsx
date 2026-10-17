'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/use-auth';
import Navigation from '@/components/navigation';
import SiteFooter from '@/components/site-footer';
import { PageHeader } from '@/components/page-header';
import ConversationalIntake from '@/components/features/conversational-intake';
import AidDashboard from '@/components/features/aid-dashboard';
import { getEligiblePrograms, rankProgramsByUrgency, UserSituation, AidProgram } from '@/lib/aid-programs';
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

  const showInlineResults = (situation: UserSituation) => {
    setUserSituation(situation);
    setEligiblePrograms(rankProgramsByUrgency(getEligiblePrograms(situation)));
  };

  // Signed-out visitors who chatted via the floating widget land here with
  // their answers stashed locally; show them the results they asked for.
  useEffect(() => {
    if (loading || user) return;
    const pending = readPendingSituation();
    if (!pending) return;
    // Deferred so state isn't set synchronously inside the effect body.
    const timer = setTimeout(() => showInlineResults(pending as UserSituation), 0);
    return () => clearTimeout(timer);
  }, [loading, user]);

  const handleIntakeComplete = async (situation: UserSituation) => {
    // Signed in: save to the account so My Aid and Deadlines use these answers.
    const outcome = await persistIntakeSituation(situation);
    if (outcome === 'saved') {
      router.push('/dashboard');
      return;
    }
    // Signed out (or save failed): show results inline; answers stay stashed
    // locally and are saved once the user signs in.
    showInlineResults(situation);
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
          <div className="ac-page ac-page-narrow">
            <p className="ac-muted" role="status">Loading…</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation />

      <main className="flex-1">
        <div className={`ac-page${userSituation ? '' : ' ac-page-narrow'}`}>
          {!userSituation ? (
            <ConversationalIntake onComplete={handleIntakeComplete} />
          ) : (
            <div>
              <PageHeader
                kicker="Your results"
                title="Programs that may fit"
                lead={`Based on what you shared${userSituation.county ? ` about ${userSituation.county}` : ''}, here ${
                  eligiblePrograms.length === 1 ? 'is 1 program' : `are ${eligiblePrograms.length} programs`
                } to explore.`}
              />

              <AidDashboard programs={eligiblePrograms} userSituation={userSituation} />

              {!user && (
                <section className="ac-card mt-10 max-w-2xl" aria-labelledby="save-results-heading">
                  <h2 id="save-results-heading" className="ac-h3">Want to save your results?</h2>
                  <p className="text-[1rem] leading-relaxed text-[#55483d]">
                    Create a free account to keep your programs and deadlines in one place.
                  </p>
                  <a href="/sign-up?next=/dashboard" className="ac-btn mt-5">
                    Create a free account
                  </a>
                </section>
              )}

              <div className="mt-8">
                <button type="button" onClick={handleReset} className="ac-btn-ghost">
                  Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
