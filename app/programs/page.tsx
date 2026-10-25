'use client';

/**
 * Programs page.
 *
 * Shows the aid programs the user's saved situation (from the Question Form
 * or the chatbot) is eligible for, ranked against the live Google Sheet
 * database via /api/aid-programs. Split out from the Question Form so
 * answering questions and viewing matches are separate tabs.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import AidDashboard from '@/components/features/aid-dashboard';
import { UserSituation, AidProgram } from '@/lib/aid-programs';
import { rankedProgramToAidProgram } from '@/lib/sheets/aid-programs-adapter';

export default function ProgramsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [userSituation, setUserSituation] = useState<UserSituation | null>(null);
  const [eligiblePrograms, setEligiblePrograms] = useState<AidProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);

  const loadRankedPrograms = async (situation: UserSituation) => {
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
      }
    } catch (error) {
      console.error('Error loading aid programs:', error);
    }
    setIsMatching(false);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
      return;
    }

    const loadUserSituation = async () => {
      if (!user) return;
      try {
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

  const handleStartOver = async () => {
    try {
      await fetch('/api/user-situation', { method: 'DELETE' });
      setUserSituation(null);
      setEligiblePrograms([]);
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

          {!userSituation ? (
            <div className="relative max-w-2xl mx-auto text-center bg-[#faf6f1] rounded-[14px] border border-[#e4d9cf] p-10">
              <p className="ac-reveal mb-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#895031]">
                Programs
              </p>
              <h1 className="ac-reveal font-serif text-[clamp(1.6rem,4vw,2.2rem)] font-medium leading-[1.15] tracking-[-0.01em] text-[#1f1610] mb-4">
                Programs That May Fit
              </h1>
              <p className="text-[#1f1610] text-[1.05rem] mb-4">
                You haven&apos;t shared any details about your situation yet.
              </p>
              <p className="text-[#6b5a4e] mb-6">
                Chat with Wren or fill out the Question Form to see your matching programs.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/conversational"
                  className="inline-block bg-[#3d2b20] text-white rounded-[10px] px-6 py-3 font-semibold no-underline hover:bg-[#2b1e15] transition-colors"
                >
                  Chat with Wren
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-block border border-[#3d2b20] text-[#3d2b20] rounded-[10px] px-6 py-3 font-semibold no-underline hover:bg-[#f2ece5] transition-colors"
                >
                  Question Form
                </Link>
              </div>
            </div>
          ) : isMatching ? (
            <div className="text-center py-12">
              <p className="text-[#6b5a4e]">Finding programs that may fit...</p>
            </div>
          ) : (
            <div>
              <AidDashboard programs={eligiblePrograms} userSituation={userSituation} />

              <div className="text-center mt-8 flex items-center justify-center gap-6">
                <Link href="/dashboard" className="text-[#895031] hover:text-[#6b5a4e] font-medium text-sm no-underline">
                  ← Edit Answers
                </Link>
                <button
                  onClick={handleStartOver}
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
