import type { UserSituation } from '@/lib/aid-programs';

// Holds a situation gathered while signed out (or when a save failed) so the
// Dashboard can save it to the user's account once they're signed in.
const PENDING_SITUATION_KEY = 'pendingUserSituation';

export function stashPendingSituation(situation: Partial<UserSituation>) {
  try {
    localStorage.setItem(PENDING_SITUATION_KEY, JSON.stringify(situation));
  } catch {
    // Storage unavailable (private mode, quota); nothing more we can do.
  }
}

export function readPendingSituation(): Partial<UserSituation> | null {
  try {
    const stored = localStorage.getItem(PENDING_SITUATION_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingSituation() {
  try {
    localStorage.removeItem(PENDING_SITUATION_KEY);
  } catch {
    // Ignore.
  }
}

/**
 * POSTs a (possibly partial) situation to the signed-in user's saved profile.
 * The API merges into the existing document, so a partial chatbot situation
 * only overwrites the fields it actually contains.
 */
export async function saveUserSituation(situation: Partial<UserSituation>): Promise<boolean> {
  try {
    const res = await fetch('/api/user-situation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(situation),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Saves to the account when possible, otherwise stashes locally for later. */
export async function persistIntakeSituation(situation: Partial<UserSituation>): Promise<'saved' | 'pending'> {
  if (await saveUserSituation(situation)) {
    clearPendingSituation();
    return 'saved';
  }
  stashPendingSituation(situation);
  return 'pending';
}
