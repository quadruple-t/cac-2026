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
 * The user's situation is persisted to Firestore (via /api/user-situation) so
 * it's shared across this page, the Deadline Tracker, Settings, and the
 * chatbot without re-asking the same questions.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/use-auth';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import SiteFooter from '@/components/site-footer';
import { PageHeader } from '@/components/page-header';
import AidDashboard from '@/components/features/aid-dashboard';
import AidIntakeForm from '@/components/features/aid-intake';
import { UserSituation, AidProgram } from '@/lib/aid-programs';
import { rankedProgramToAidProgram } from '@/lib/sheets/aid-programs-adapter';
import {
  clearPendingSituation,
  readPendingSituation,
  saveUserSituation,
} from '@/lib/user-situation-client';

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

  // True while the user has re-opened the intake form to edit an existing
  // situation (as opposed to `!userSituation`, which is the first-time path).
  const [isEditing, setIsEditing] = useState(false);

  // Ranks the live Google Sheet program database against a situation via
  // the server (the Sheets API credentials can't live in the browser).
  const loadRankedPrograms = async (situation: UserSituation) => {
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
      }
    } catch (error) {
      console.error('Error loading aid programs:', error);
    }
  };

  useEffect(() => {
    // Route guard: bounce anonymous visitors to sign-in once Firebase has
    // finished checking auth state. (Also enforced server-side by the
    // proxy/middleware, but this handles the client-rendered case too.)
    if (!loading && !user) {
      router.push('/sign-in');
      return;
    }

    // Load user situation from Firebase
    const loadUserSituation = async () => {
      if (!user) return;
      try {
        // Answers gathered by the chatbot while signed out are stashed locally;
        // save them to the account now so they show up everywhere.
        const pending = readPendingSituation();
        if (pending && (await saveUserSituation(pending))) {
          clearPendingSituation();
        }

        const res = await fetch('/api/user-situation');
        if (res.ok) {
          const data = await res.json();
          if (data.situation) {
            setUserSituation(data.situation);
            await loadRankedPrograms(data.situation);
          }
        }
      } catch (error) {
        console.error('Error loading user situation:', error);
      }
      setIsLoading(false);
    };

    loadUserSituation();
  }, [user, loading, router]);

  const handleFormSubmit = async (situation: UserSituation) => {
    try {
      const res = await fetch('/api/user-situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(situation),
      });
      if (res.ok) {
        setUserSituation(situation);
        await loadRankedPrograms(situation);
        setIsEditing(false);
      } else {
        const errorData = await res.json();
        console.error('Failed to save user situation:', errorData);
        alert(`Failed to save: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving user situation:', error);
      alert('Error saving user situation. Check console for details.');
    }
  };

  const handleReset = async () => {
    if (!confirm('Start over? This deletes your saved answers. Your pinned programs stay.')) return;
    try {
      await fetch('/api/user-situation', { method: 'DELETE' });
      setUserSituation(null);
      setEligiblePrograms([]);
    } catch (error) {
      console.error('Error deleting user situation:', error);
    }
  };

  // While Firebase auth is still resolving, or while we're checking
  // localStorage for a saved situation, show a minimal loading state rather
  // than the intake form (which would otherwise flash briefly).
  if (loading || isLoading) {
    return (
      <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
        <Navigation />
        <main className="flex-1">
          <div className="ac-page">
            <p className="ac-muted" role="status">Loading your aid programs…</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // One opener for the whole page, adapting to whether we're showing the
  // questionnaire or the ranked results.
  const showingForm = !userSituation || isEditing;
  const programCount = eligiblePrograms.length;

  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation />

      <main className="flex-1">
        <div className="ac-page">
          {showingForm ? (
            <PageHeader
              kicker="My aid"
              title={userSituation ? 'Update your answers' : 'Find aid for your situation'}
              lead={
                userSituation
                  ? 'Change anything that’s different now, and we’ll re-rank your programs.'
                  : 'Answer a few questions and we’ll show the aid programs that fit you best.'
              }
            />
          ) : (
            <PageHeader
              kicker="My aid"
              title="Programs that may fit"
              lead={`Based on your situation in ${userSituation?.county || 'your area'}, here ${
                programCount === 1 ? 'is 1 program' : `are ${programCount} programs`
              }, best fit and soonest deadline first.`}
            >
              <button type="button" onClick={() => setIsEditing(true)} className="ac-btn-ghost">
                Edit my answers
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="ac-link min-h-[44px] cursor-pointer bg-transparent px-1 text-[1rem] underline decoration-[#d8b9a4] underline-offset-4 hover:text-[#3d2b20]"
              >
                Start over
              </button>
            </PageHeader>
          )}

          {/* Main Content:
              - No situation yet, or the user chose to edit -> show the intake form.
              - Situation exists -> show the ranked program list. */}
          {showingForm ? (
            <AidIntakeForm
              onSubmit={handleFormSubmit}
              initialData={userSituation ?? undefined}
              onCancel={userSituation ? () => setIsEditing(false) : undefined}
              submitLabel={userSituation ? 'Update my results' : undefined}
            />
          ) : (
            <AidDashboard programs={eligiblePrograms} userSituation={userSituation} />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
