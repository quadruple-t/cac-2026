'use client';

/**
 * Settings page.
 *
 * Lets a signed-in user review and update everything they entered in the
 * Disaster Aid Center intake form, outside of the aid-matching flow. Reuses
 * the same `AidIntakeForm` component and `/api/user-situation` Firestore
 * endpoints the Dashboard page already uses, so edits made here are the same
 * data the Dashboard, Deadline Tracker, etc. read from.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/use-auth';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import AidIntakeForm from '@/components/features/aid-intake';
import { UserSituation } from '@/lib/aid-programs';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [userSituation, setUserSituation] = useState<UserSituation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
      return;
    }

    const loadUserSituation = async () => {
      try {
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

  const handleSave = async (situation: UserSituation) => {
    try {
      const res = await fetch('/api/user-situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(situation),
      });
      if (res.ok) {
        setUserSituation(situation);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 3000);
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

  const handleClearData = async () => {
    if (!confirm('This will permanently delete all your saved answers. Are you sure?')) {
      return;
    }
    try {
      await fetch('/api/user-situation', { method: 'DELETE' });
      setUserSituation(null);
    } catch (error) {
      console.error('Error deleting user situation:', error);
    }
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
        <section className="relative mx-auto max-w-[1080px] overflow-hidden px-[22px] py-[56px]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 h-80 w-80 rounded-full bg-[#d9b69d]/20 blur-3xl" />

          <div className="relative mb-[34px] text-center">
            <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
              Settings
            </p>
            <h1 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
              Manage Your Answers
            </h1>
            <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] leading-relaxed max-w-2xl mx-auto">
              Review and update the details you shared in the Disaster Aid Center. Changes here update
              your aid matches and document checklist everywhere in the app.
            </p>
            {justSaved && (
              <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-[#d8b9a4] bg-[#fffaf5]/80 px-3 py-1.5 text-xs font-semibold text-[#895031] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#b0673f]" /> Saved
              </div>
            )}
          </div>

          <AidIntakeForm
            initialData={userSituation ?? undefined}
            submitLabel="Save Changes"
            onSubmit={handleSave}
            onCancel={() => router.push('/dashboard')}
          />

          {userSituation && (
            <div className="text-center mt-8">
              <button
                onClick={handleClearData}
                className="text-[#895031] hover:text-[#6b5a4e] font-medium text-sm"
              >
                Clear all my data
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
