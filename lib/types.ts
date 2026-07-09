// Shared domain types for Aid Compass.
// These are used by the static Phase 1 form flow and are designed to be reused
// by the Phase 2 conversational intake (which will produce the same IntakeAnswers).

export type Ownership = "owner" | "renter";

// A program may be open to owners, renters, or both.
export type ProgramOwnership = Ownership | "both";

// Damage categories a survivor can select and a program can cover.
// "any" on a program means it does not restrict by damage type.
export type DamageType =
  | "flood"
  | "wind"
  | "structural"
  | "personal-property"
  | "vehicle"
  | "business"
  | "agricultural";

export interface ProgramEligibility {
  /** Who can apply. */
  ownerOrRenter: ProgramOwnership;
  /** Eligible counties. Use ["all"] for statewide / nationwide programs. */
  county: string[];
  /** Maximum annual household income to qualify, or null for no income limit. */
  incomeMax: number | null;
  /** Damage types covered. Use ["any"] when the program is not damage-specific. */
  damageType: string[];
}

export interface Program {
  id: string;
  name: string;
  agency: string;
  /** Maximum award in USD, or null when the program does not grant money directly. */
  maxAmount: number | null;
  /** ISO date (YYYY-MM-DD) or "Ongoing" for rolling programs. */
  deadline: string;
  eligibility: ProgramEligibility;
  requiredDocs: string[];
  applyUrl: string;
  description: string;
}

// Structured answers produced by intake (form in Phase 1, chat in Phase 2).
export interface IntakeAnswers {
  county: string;
  ownerOrRenter: Ownership;
  damageType: DamageType[];
  /** Lower bound of the selected income bracket, or null if not provided. */
  income: number | null;
  /** Human-readable label for the income bracket, for display. */
  incomeBracket: string;
  appliedToFema: boolean;
}
