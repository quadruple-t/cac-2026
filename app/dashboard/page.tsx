'use client';

/**
 * Question Form page.
 *
 * Collects a "situation" from the user (county, damage type, ownership,
 * income, etc.) via a short intake form, and saves it to Firestore (via
 * /api/user-situation) so it's shared across this page, the Programs tab,
 * the Deadline Tracker, Settings, and the chatbot without re-asking the
 * same questions. Submitting sends the user to the Programs tab to see
 * their matches.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/use-auth';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import AidIntakeForm from '@/components/features/aid-intake';
import { UserSituation } from '@/lib/aid-programs';
import {
  clearPendingSituation,
  readPendingSituation,
  saveUserSituation,
} from '@/lib/user-situation-client';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // The user's previously-saved answers, if any — pre-fills the form so
  // revisiting this tab edits rather than starts from scratch. Null until
  // we've checked (this session or a previous one, via Firestore).
  const [userSituation, setUserSituation] = useState<UserSituation | null>(null);

  // Local "is this page ready to render" flag, separate from Firebase's own
  // `loading`. Covers the fetch below so we don't flash an empty form for a
  // split second before swapping in the saved answers.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Route guard: bounce anonymous visitors to sign-in once Firebase has
    // finished checking auth state. (Also enforced server-side by proxy.ts,
    // but this handles the client-rendered case too.)
    if (!loading && !user) {
      router.push('/sign-in');
      return;
    }

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
        router.push('/programs');
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

  // While Firebase auth is still resolving, or while we're checking for a
  // saved situation, show a minimal loading state rather than the form
  // (which would otherwise flash briefly empty, then pre-filled).
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
          <div className="relative mb-[34px] text-center">
            <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
              Question Form
            </p>
            <h1 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
              Tell Us About Your Situation
            </h1>
            <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] leading-relaxed max-w-2xl mx-auto">
              Answer a few quick questions to see which aid programs you can apply for.
            </p>
            <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-[#d8b9a4] bg-[#fffaf5]/80 px-3 py-1.5 text-xs font-semibold text-[#895031] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#b0673f]" /> Personalized for your situation
            </div>
          </div>

          <AidIntakeForm
            onSubmit={handleFormSubmit}
            initialData={userSituation ?? undefined}
            submitLabel={userSituation ? 'Update & See My Programs' : 'Save & See My Programs'}
          />
        </section>
      </main>
    </div>
  );
}
