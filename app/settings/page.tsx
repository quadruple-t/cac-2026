'use client';

/**
 * Settings page.
 *
 * Rather than re-running the Aid Center questionnaire, this shows an
 * AI-generated plain-language summary of the user's stored situation
 * (already in Firestore via /api/user-situation) and lets them correct it by
 * typing a short natural-language note — similar to editing a memory. Each
 * note is turned into a proposed patch the user reviews and confirms before
 * anything is saved.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import { CompassStatus } from '@/components/compass-status';
import { UserSituation } from '@/lib/aid-programs';
import { getGeminiModel, getCorrectionExtractionModel } from '@/lib/firebase/ai';
import {
  buildSummaryPrompt,
  buildCorrectionPrompt,
  parseCorrectionResponse,
  formatFieldLabel,
  formatFieldValue,
} from '@/lib/situation-memory';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [situation, setSituation] = useState<UserSituation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [noteInput, setNoteInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Partial<UserSituation> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const generateSummary = useCallback(async (current: UserSituation) => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const result = await getGeminiModel().generateContent(buildSummaryPrompt(current));
      setSummary(result.response.text().trim());
    } catch (error) {
      console.error('Error generating situation summary:', error);
      setSummaryError("Couldn't generate a summary right now. Your saved answers are still safe.");
    }
    setSummaryLoading(false);
  }, []);

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
            setSituation(data.situation);
            await generateSummary(data.situation);
          }
        }
      } catch (error) {
        console.error('Error loading user situation:', error);
      }
      setIsLoading(false);
    };

    loadUserSituation();
  }, [user, loading, router, generateSummary]);

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation || !noteInput.trim() || isExtracting) return;

    setIsExtracting(true);
    setExtractError(null);
    setPendingChanges(null);

    try {
      const result = await getCorrectionExtractionModel().generateContent(
        buildCorrectionPrompt(situation, noteInput.trim())
      );
      const diff = parseCorrectionResponse(result.response.text());

      if (Object.keys(diff).length === 0) {
        setExtractError("I couldn't tell what to update from that — try naming the specific detail that changed.");
      } else {
        setPendingChanges(diff);
      }
    } catch (error) {
      console.error('Error extracting correction:', error);
      setExtractError("Something went wrong reading that note. Please try again.");
    }

    setIsExtracting(false);
  };

  const handleConfirmChanges = async () => {
    if (!situation || !pendingChanges) return;

    setIsSaving(true);
    try {
      const merged = { ...situation, ...pendingChanges };
      const res = await fetch('/api/user-situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingChanges),
      });
      if (res.ok) {
        setSituation(merged);
        setPendingChanges(null);
        setNoteInput('');
        await generateSummary(merged);
      } else {
        const errorData = await res.json();
        console.error('Failed to save correction:', errorData);
        alert(`Failed to save: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving correction:', error);
      alert('Error saving changes. Check console for details.');
    }
    setIsSaving(false);
  };

  const handleDiscardChanges = () => {
    setPendingChanges(null);
  };

  const handleClearData = async () => {
    if (!confirm('This will permanently delete all your saved answers. Are you sure?')) {
      return;
    }
    try {
      await fetch('/api/user-situation', { method: 'DELETE' });
      setSituation(null);
      setSummary(null);
      setPendingChanges(null);
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
              What We Know About Your Situation
            </h1>
            <p className="ac-reveal-2 text-[#6b5a4e] text-[1.05rem] leading-relaxed max-w-2xl mx-auto">
              Here&apos;s a summary of the answers you&apos;ve shared with Aid Compass. If anything has
              changed or looks wrong, just tell us in your own words below.
            </p>
          </div>

          {!situation ? (
            <div className="relative max-w-2xl mx-auto text-center bg-[#faf6f1] rounded-[14px] border border-[#e4d9cf] p-10">
              <p className="text-[#1f1610] text-[1.05rem] mb-4">
                You haven&apos;t shared any details about your situation yet.
              </p>
              <p className="text-[#6b5a4e] mb-6">
                Start with the Disaster Aid Center to answer a few questions — you&apos;ll be able to
                come back here anytime to review or correct what you told us.
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-[#3d2b20] text-white rounded-[10px] px-6 py-3 font-semibold no-underline hover:bg-[#2b1e15] transition-colors"
              >
                Go to Aid Center
              </Link>
            </div>
          ) : (
            <div className="relative max-w-2xl mx-auto space-y-6">
              {/* AI-generated summary */}
              <div className="bg-[#faf6f1] rounded-[14px] border border-[#e4d9cf] p-6">
                <p className="text-sm text-[#895031] font-semibold uppercase tracking-[0.08em] mb-3">
                  Your Situation, Summarized
                </p>
                {summaryLoading ? (
                  <p className="text-[#6b5a4e]">Reading through your answers...</p>
                ) : summaryError ? (
                  <p className="text-[#6b5a4e]">{summaryError}</p>
                ) : (
                  <p className="text-[#1f1610] leading-relaxed whitespace-pre-wrap">{summary}</p>
                )}
              </div>

              {/* Correction box */}
              <div className="bg-white rounded-[14px] border border-[#e4d9cf] p-6">
                <p className="text-sm text-[#895031] font-semibold uppercase tracking-[0.08em] mb-3">
                  Update Something
                </p>
                <form onSubmit={handleSubmitNote} className="space-y-3">
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="e.g. My roof has since been repaired, or I don't have insurance anymore"
                    disabled={isExtracting || isSaving}
                    rows={3}
                    className="w-full px-4 py-3 border border-[#e4d9cf] rounded-[14px] focus:ring-2 focus:ring-[#b0673f] focus:border-[#b0673f] text-[#1f1610] bg-white transition-shadow disabled:opacity-50 text-[1.05rem]"
                  />
                  <button
                    type="submit"
                    disabled={!noteInput.trim() || isExtracting || isSaving}
                    className="bg-[#3d2b20] text-white rounded-[10px] px-6 py-3 font-semibold hover:bg-[#2b1e15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExtracting ? 'Reading...' : 'Update My Info'}
                  </button>
                </form>

                {extractError && (
                  <div className="mt-4 flex items-center gap-3">
                    <CompassStatus tone="attention" label="Couldn't apply" />
                    <p className="text-sm text-[#6b5a4e]">{extractError}</p>
                  </div>
                )}

                {/* Diff review */}
                {pendingChanges && (
                  <div className="mt-5 border border-[#e4d9cf] rounded-[14px] p-4 bg-[#faf6f1]">
                    <p className="text-sm text-[#895031] font-semibold uppercase tracking-[0.08em] mb-3">
                      Here&apos;s what I&apos;ll update
                    </p>
                    <ul className="space-y-2 mb-4">
                      {Object.entries(pendingChanges).map(([key, value]) => (
                        <li key={key} className="text-sm text-[#1f1610]">
                          <span className="font-semibold">{formatFieldLabel(key)}:</span>{' '}
                          <span className="text-[#6b5a4e] line-through mr-1">
                            {formatFieldValue(situation[key as keyof UserSituation])}
                          </span>
                          <span>→ {formatFieldValue(value)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-4">
                      <button
                        onClick={handleConfirmChanges}
                        disabled={isSaving}
                        className="bg-[#b0673f] text-white rounded-[10px] px-5 py-2 font-semibold hover:bg-[#895031] transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Looks Right, Save'}
                      </button>
                      <button
                        onClick={handleDiscardChanges}
                        disabled={isSaving}
                        className="text-[#895031] hover:text-[#6b5a4e] font-medium text-sm disabled:opacity-50"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <button
                  onClick={handleClearData}
                  className="text-[#895031] hover:text-[#6b5a4e] font-medium text-sm"
                >
                  Clear all my data
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
