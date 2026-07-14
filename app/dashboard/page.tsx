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
import AidIntakeForm from '@/components/features/aid-intake';
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

  // True while the user has re-opened the intake form to edit an existing
  // situation (as opposed to `!userSituation`, which is the first-time path).
  const [isEditing, setIsEditing] = useState(false);
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
      try {
        const res = await fetch('/api/user-situation');
        if (res.ok) {
          const data = await res.json();
          if (data.situation) {
            setUserSituation(data.situation);
            const eligible = getEligiblePrograms(data.situation);
            const ranked = rankProgramsByUrgency(eligible);
            setEligiblePrograms(ranked);
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
        const eligible = getEligiblePrograms(situation);
        const ranked = rankProgramsByUrgency(eligible);
        setEligiblePrograms(ranked);
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
        <section className="relative mx-auto max-w-[1080px] overflow-hidden px-[22px] py-[56px]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 h-80 w-80 rounded-full bg-[#d9b69d]/20 blur-3xl" />
          {/* Header — always visible, regardless of which step the user is on. */}
          <div className="relative mb-[34px] text-center">
            <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
              Disaster Aid Center
            </p>
            <h1 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
              Your Personalized Aid Resources
            </h1>
            <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] leading-relaxed max-w-2xl mx-auto">
              Answer a few questions about your situation to discover eligible aid programs.
            </p>
            <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-[#d8b9a4] bg-[#fffaf5]/80 px-3 py-1.5 text-xs font-semibold text-[#895031] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#b0673f]" /> Personalized for your situation
            </div>
          </div>

          {/* Main Content:
              - No situation yet, or the user chose to edit -> show the intake form.
              - Situation exists -> show the tabbed programs/documents view. */}
          {!userSituation || isEditing ? (
            <AidIntakeForm
              onSubmit={handleFormSubmit}
              initialData={userSituation ?? undefined}
              onCancel={userSituation ? () => setIsEditing(false) : undefined}
              submitLabel={userSituation ? 'Update My Results' : undefined}
            />
          ) : (
            <div>
              <AidDashboard programs={eligiblePrograms} userSituation={userSituation} />

              <div className="text-center mt-8 flex items-center justify-center gap-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[#895031] hover:text-[#6b5a4e] font-medium text-sm"
                >
                  ← Edit Answers
                </button>
                <button
                  onClick={handleReset}
                  className="text-[#895031] hover:text-[#6b5a4e] font-medium text-sm"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
