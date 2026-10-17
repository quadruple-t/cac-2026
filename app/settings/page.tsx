'use client';

/**
 * Settings page.
 *
 * Shows the user's stored situation (Firestore via /api/user-situation) as an
 * AI-generated plain-language summary, lets them edit the core answers
 * directly, and lets them correct anything by typing a short natural-language
 * note — similar to editing a memory. Each
 * note is turned into a proposed patch the user reviews and confirms before
 * anything is saved.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import SiteFooter from '@/components/site-footer';
import { PageHeader } from '@/components/page-header';
import { CompassStatus } from '@/components/compass-status';
import SituationEditor from '@/components/features/situation-editor';
import { UserSituation } from '@/lib/aid-programs';
import { getGeminiModel, getCorrectionExtractionModel, aiErrorMessage } from '@/lib/firebase/ai';
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
      setSummaryError(
        aiErrorMessage(error, "Couldn't generate a summary right now.") + ' Your saved answers are still safe.'
      );
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
      setExtractError(aiErrorMessage(error, 'Something went wrong reading that note. Please try again.'));
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

  // Direct edit of the core fields (no AI round trip). Works for users who
  // have no saved situation yet, too: the first save creates it.
  const handleDirectSave = async (patch: Partial<UserSituation>) => {
    try {
      const res = await fetch('/api/user-situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) return false;

      // Null in the patch means the field was cleared.
      const merged = { ...(situation ?? {}), ...patch } as Record<string, unknown>;
      for (const key of Object.keys(merged)) {
        if (merged[key] === null) delete merged[key];
      }
      setSituation(merged as unknown as UserSituation);
      setPendingChanges(null);
      void generateSummary(merged as unknown as UserSituation);
      return true;
    } catch (error) {
      console.error('Error saving edits:', error);
      return false;
    }
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

  const isPageLoading = loading || isLoading;

  // One layout for every state, so the header stays put (and only animates
  // in once) while the saved answers load.
  return (
    <div className="min-h-full bg-[#f2ece5] flex flex-col flex-1">
      <Navigation />

      <main className="flex-1">
        <div className="ac-page ac-page-narrow">
          <PageHeader
            kicker="My info"
            title="What we know about your situation"
            lead="Here's what Aid Compass saved from your chat and questionnaire. Edit any answer directly, or tell us what changed in your own words."
          />

          {isPageLoading ? (
            <p role="status" className="ac-muted m-0">
              Loading your saved answers...
            </p>
          ) : !situation ? (
            <div className="space-y-6">
              <section aria-labelledby="no-info-heading" className="ac-card">
                <h2 id="no-info-heading" className="ac-h3">
                  You haven&apos;t shared any details yet
                </h2>
                <p className="ac-muted m-0 leading-relaxed">
                  Fill in the details below, chat with Wren, or use the full questionnaire. You can come back
                  here anytime to review or correct what you told us.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/conversational" className="ac-btn">
                    Chat with Wren
                  </Link>
                  <Link href="/dashboard" className="ac-btn-ghost">
                    Open the full questionnaire
                  </Link>
                </div>
              </section>

              <section aria-labelledby="edit-heading" className="ac-card">
                <h2 id="edit-heading" className="ac-h3">
                  Or fill in the basics here
                </h2>
                <p className="ac-note m-0 mb-5">Answer as many as you like. You can change them later.</p>
                <SituationEditor situation={null} onSave={handleDirectSave} />
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <section aria-labelledby="summary-heading" className="ac-card">
                <h2 id="summary-heading" className="ac-h3">
                  Your situation, summarized
                </h2>
                {summaryLoading ? (
                  <p className="ac-muted m-0">Reading through your answers...</p>
                ) : summaryError ? (
                  <p className="ac-muted m-0">{summaryError}</p>
                ) : (
                  <p className="m-0 whitespace-pre-wrap text-[1.05rem] leading-relaxed text-[#1f1610]">{summary}</p>
                )}
              </section>

              {/* Direct edit */}
              <section aria-labelledby="edit-heading" className="ac-card">
                <h2 id="edit-heading" className="ac-h3">
                  Edit your answers
                </h2>
                <p className="ac-note m-0 mb-5">
                  Need to change other details?{' '}
                  <Link href="/dashboard" className="ac-link">
                    Open the full questionnaire
                  </Link>
                  .
                </p>
                <SituationEditor situation={situation} onSave={handleDirectSave} />
              </section>

              {/* Correction box */}
              <section aria-labelledby="note-heading" className="ac-card">
                <h2 id="note-heading" className="ac-h3">
                  Tell us what changed
                </h2>
                <p className="ac-note m-0 mb-5">
                  Describe it in your own words. We&apos;ll show you exactly what will change before anything is saved.
                </p>
                <form onSubmit={handleSubmitNote} className="space-y-4">
                  <div>
                    <label htmlFor="situation-note" className="ac-label">
                      What&apos;s different now?
                    </label>
                    <textarea
                      id="situation-note"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="e.g. My roof has since been repaired, or I don't have insurance anymore"
                      disabled={isExtracting || isSaving}
                      rows={3}
                      className="ac-input leading-relaxed"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!noteInput.trim() || isExtracting || isSaving}
                    className="ac-btn-dark"
                  >
                    {isExtracting ? 'Reading your note...' : 'Preview changes'}
                  </button>
                </form>

                {extractError && (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <CompassStatus tone="attention" label="Couldn't apply" />
                    <p className="ac-muted m-0 text-[0.95rem]">{extractError}</p>
                  </div>
                )}

                {/* Diff review */}
                {pendingChanges && (
                  <div className="mt-6 rounded-[12px] border border-[#e4d9cf] bg-[#f2ece5] p-5">
                    <h3 className="m-0 mb-3 font-serif text-[1.15rem] font-medium tracking-[-0.01em] text-[#1f1610]">
                      Here&apos;s what I&apos;ll update
                    </h3>
                    <ul className="m-0 mb-5 grid list-none gap-2 p-0">
                      {Object.entries(pendingChanges).map(([key, value]) => (
                        <li key={key} className="text-[0.95rem] leading-relaxed text-[#1f1610]">
                          <span className="font-semibold">{formatFieldLabel(key)}:</span>{' '}
                          <span className="mr-1 text-[#6b5a4e] line-through">
                            {formatFieldValue(situation[key as keyof UserSituation])}
                          </span>
                          <span>→ {formatFieldValue(value)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap items-center gap-3">
                      <button onClick={handleConfirmChanges} disabled={isSaving} className="ac-btn">
                        {isSaving ? 'Saving...' : 'Save these changes'}
                      </button>
                      <button onClick={handleDiscardChanges} disabled={isSaving} className="ac-btn-ghost">
                        Discard
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Destructive action, kept apart from the everyday ones */}
              <section aria-labelledby="delete-heading" className="mt-10 border-t border-[#e4d9cf] pt-8">
                <h2 id="delete-heading" className="m-0 mb-1 text-base font-semibold text-[#1f1610]">
                  Delete your saved answers
                </h2>
                <p className="ac-note m-0 mb-4">
                  This permanently removes everything above from your account. It can&apos;t be undone.
                </p>
                <button
                  onClick={handleClearData}
                  className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[10px] border border-[#d9b3a8] bg-transparent px-5 font-semibold text-[#a33a2a] transition-colors hover:border-[#a33a2a] hover:bg-[#faf6f1] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#a33a2a]"
                >
                  Clear all my data
                </button>
              </section>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
