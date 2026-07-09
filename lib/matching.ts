import programsData from "@/data/programs.json";
import type { IntakeAnswers, Program } from "./types";

export const programs = programsData as Program[];

// Programs that require a FEMA registration number before you can apply.
// Used to nudge users who have not yet applied to FEMA.
const REQUIRES_FEMA_FIRST = new Set(["sba-disaster-loan", "nc-disaster-recovery"]);

export interface MatchReason {
  /** Short field label, e.g. "County" or "Ownership". */
  field: string;
  /** Why the user's answer satisfied this field. */
  detail: string;
}

export interface MatchResult {
  program: Program;
  /** The specific fields the user's answers matched on (trust / transparency). */
  matchedOn: MatchReason[];
  /** Non-blocking notes, e.g. income not restricted or "apply to FEMA first". */
  notes: string[];
}

function damageLabel(value: string): string {
  const labels: Record<string, string> = {
    flood: "flooding",
    wind: "wind damage",
    structural: "structural damage",
    "personal-property": "personal property loss",
    vehicle: "vehicle damage",
    business: "lost income / business",
    agricultural: "agricultural loss",
  };
  return labels[value] ?? value;
}

/**
 * Runs a single program against a user's answers.
 * Returns a MatchResult when the program is eligible, or null when the user is
 * excluded by county, ownership, income, or damage type.
 *
 * The `matchedOn` array is the visible reasoning the UI shows so eligibility is
 * never a silent decision.
 */
export function evaluateProgram(
  program: Program,
  answers: IntakeAnswers
): MatchResult | null {
  const { eligibility } = program;
  const matchedOn: MatchReason[] = [];
  const notes: string[] = [];

  // --- County ---
  const coversAllCounties = eligibility.county.includes("all");
  if (coversAllCounties) {
    matchedOn.push({ field: "County", detail: "Available in all declared areas" });
  } else if (eligibility.county.includes(answers.county)) {
    matchedOn.push({ field: "County", detail: `Serves ${answers.county} County` });
  } else {
    return null;
  }

  // --- Ownership ---
  if (eligibility.ownerOrRenter === "both") {
    matchedOn.push({ field: "Ownership", detail: "Open to homeowners and renters" });
  } else if (eligibility.ownerOrRenter === answers.ownerOrRenter) {
    matchedOn.push({
      field: "Ownership",
      detail: answers.ownerOrRenter === "owner" ? "Open to homeowners" : "Open to renters",
    });
  } else {
    return null;
  }

  // --- Income ---
  if (eligibility.incomeMax === null) {
    notes.push("No income limit.");
  } else if (answers.income === null) {
    // User declined to share income: don't exclude, but flag it.
    matchedOn.push({
      field: "Income",
      detail: `Income limit is $${eligibility.incomeMax.toLocaleString()} — verify you qualify`,
    });
  } else if (answers.income <= eligibility.incomeMax) {
    matchedOn.push({
      field: "Income",
      detail: `Within the $${eligibility.incomeMax.toLocaleString()} income limit`,
    });
  } else {
    return null;
  }

  // --- Damage type ---
  if (eligibility.damageType.includes("any")) {
    matchedOn.push({ field: "Damage", detail: "Helps with any disaster-related need" });
  } else {
    const overlap = answers.damageType.filter((d) => eligibility.damageType.includes(d));
    if (overlap.length > 0) {
      matchedOn.push({
        field: "Damage",
        detail: `Covers ${overlap.map(damageLabel).join(", ")}`,
      });
    } else {
      return null;
    }
  }

  // --- FEMA-first nudge (non-blocking) ---
  if (REQUIRES_FEMA_FIRST.has(program.id) && !answers.appliedToFema) {
    notes.push("Apply to FEMA first — this program needs your FEMA registration number.");
  }

  return { program, matchedOn, notes };
}

/**
 * Matches all programs against the user's answers, returning eligible ones
 * ranked so the highest-value grants surface first.
 */
export function matchPrograms(answers: IntakeAnswers): MatchResult[] {
  const results: MatchResult[] = [];
  for (const program of programs) {
    const result = evaluateProgram(program, answers);
    if (result) results.push(result);
  }
  return rankResults(results);
}

function rankResults(results: MatchResult[]): MatchResult[] {
  return results.sort((a, b) => {
    // Programs that grant money rank above referral/volunteer services.
    const aAmount = a.program.maxAmount ?? -1;
    const bAmount = b.program.maxAmount ?? -1;
    if (aAmount !== bAmount) return bAmount - aAmount;
    return a.program.name.localeCompare(b.program.name);
  });
}

/**
 * Dedupes required documents across matched programs into one combined
 * checklist. Used by the results dashboard (and the Phase 2 checklist feature).
 */
export function buildDocumentChecklist(results: MatchResult[]): string[] {
  const seen = new Set<string>();
  const checklist: string[] = [];
  for (const { program } of results) {
    for (const doc of program.requiredDocs) {
      const key = doc.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        checklist.push(doc.trim());
      }
    }
  }
  return checklist;
}
