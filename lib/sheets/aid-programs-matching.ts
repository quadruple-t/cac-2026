import { UserSituation } from "@/lib/aid-programs";
import { SheetAidProgram } from "./aid-programs-sheet";

// Keyword hints per Damage/Needs category (lib/aid-programs.ts's NeedCategory
// values, duplicated here as plain strings since this module doesn't depend
// on the intake form). Used to loosely match the sheet's free-text columns —
// this is a heuristic, not an exact filter, since the sheet's eligibility
// columns are prose rather than enums.
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  home: ["home", "housing", "repair", "rebuild", "residence", "structure", "building"],
  rental: ["rental", "renter", "tenant", "lease"],
  personal_property: ["personal property", "belongings", "household items", "contents"],
  vehicle: ["vehicle", "car", "auto", "transportation"],
  utilities: ["utility", "utilities", "food", "water", "energy", "power"],
  // Deliberately not just "child" — that matched Social Security survivor
  // benefits and federal retirement programs that mention "children" as
  // beneficiaries, which have nothing to do with childcare assistance.
  childcare: ["childcare", "child care", "child-care", "daycare"],
  medical: ["medical", "health", "funeral", "burial", "disability"],
  employment: ["employment", "job", "unemployment", "work", "income loss"],
  business: ["business", "commercial", "enterprise", "small business"],
  agricultural: ["farm", "agricultur", "crop", "livestock", "rancher", "forest"],
  nonprofit: ["nonprofit", "non-profit", "community organization", "church"],
};

function includesAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase();
  return needles.some(needle => lower.includes(needle));
}

/**
 * All the free-text columns worth searching for a category/need match. Some
 * programs only describe what they actually do in "Assistance Type" or the
 * description — e.g. a childcare program's "Required Damage Type" is blank,
 * but its Assistance Type literally says "Emergency childcare" — so matching
 * against a single narrow column misses real matches.
 */
function matchableText(program: SheetAidProgram): string {
  return [program.requiredDamageType, program.eligibleApplicantTypes, program.assistanceType, program.description]
    .join(" ")
    .toLowerCase();
}

function needCategoriesOf(situation: Partial<UserSituation>): string[] {
  return [situation.primaryNeed, ...(situation.supplementaryNeeds ?? [])].filter(
    (value): value is string => Boolean(value),
  );
}

// Human-readable labels matching NEED_CATEGORIES in components/features/aid-intake.
const CATEGORY_LABELS: Record<string, string> = {
  home: "Home Damage",
  rental: "Rental Housing Damage",
  personal_property: "Personal Property Loss",
  vehicle: "Vehicle and Transportation Damage",
  utilities: "Food, Utilities, and Essential Services",
  childcare: "Childcare Impact",
  medical: "Medical, Disability, and Funeral Needs",
  employment: "Employment and Income Loss",
  business: "Business Damage",
  agricultural: "Agricultural Damage",
  nonprofit: "Nonprofit Damage",
};

const COLUMN_LABELS = {
  assistanceType: "Assistance Type",
  requiredDamageType: "Required Damage Type",
  eligibleApplicantTypes: "Eligible Applicant Types",
  description: "Official Description",
} as const;

function truncate(text: string, max = 110): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

/** Finds which specific column a category's keywords actually matched in, so the explanation can cite it. */
function findCategoryMatch(program: SheetAidProgram, category: string): { column: string; snippet: string } | null {
  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords) return null;
  const fields: [string, string][] = [
    [COLUMN_LABELS.assistanceType, program.assistanceType],
    [COLUMN_LABELS.requiredDamageType, program.requiredDamageType],
    [COLUMN_LABELS.eligibleApplicantTypes, program.eligibleApplicantTypes],
    [COLUMN_LABELS.description, program.description],
  ];
  for (const [column, text] of fields) {
    if (text && includesAny(text, keywords)) {
      return { column, snippet: truncate(text) };
    }
  }
  return null;
}

export interface MatchExplanation {
  sentence: string;
  rowNumber: number;
}

/**
 * Explains, in one sentence, the specific sheet column/text that made this
 * program relevant — so the citation always points at the actual evidence,
 * not a generic "this seemed relevant" claim.
 */
export function explainMatch(program: SheetAidProgram, situation: Partial<UserSituation>): MatchExplanation {
  for (const category of needCategoriesOf(situation)) {
    const match = findCategoryMatch(program, category);
    if (match) {
      const label = CATEGORY_LABELS[category] ?? category;
      return {
        sentence: `Matches your ${label} need — its "${match.column}" column says "${match.snippet}."`,
        rowNumber: program.rowNumber,
      };
    }
  }

  const county = situation.county?.toLowerCase().trim();
  if (county && program.eligibleCounties.toLowerCase().includes(county)) {
    return {
      sentence: `Serves ${situation.county} County — its "Eligible Counties" column says "${truncate(program.eligibleCounties)}."`,
      rowNumber: program.rowNumber,
    };
  }

  const ownershipText = program.homeownerRenterRequirements;
  const ownershipLower = ownershipText.toLowerCase();
  if ((situation.ownershipStatus === "owner" || situation.housingStatus === "homeowner")
    && (ownershipLower.includes("owner") || ownershipLower.includes("homeowner"))) {
    return {
      sentence: `Matches your homeowner status — its "Homeowner / Renter / Lease Requirements" column says "${truncate(ownershipText)}."`,
      rowNumber: program.rowNumber,
    };
  }
  if ((situation.ownershipStatus === "renter" || situation.housingStatus === "renter")
    && (ownershipLower.includes("renter") || ownershipLower.includes("tenant"))) {
    return {
      sentence: `Matches your renter status — its "Homeowner / Renter / Lease Requirements" column says "${truncate(ownershipText)}."`,
      rowNumber: program.rowNumber,
    };
  }

  if (situation.isFarmer || situation.applicantCategory === "farmer") {
    const match = findCategoryMatch(program, "agricultural");
    if (match) {
      return {
        sentence: `Matches your farm/agricultural situation — its "${match.column}" column says "${match.snippet}."`,
        rowNumber: program.rowNumber,
      };
    }
  }

  return {
    sentence: `Shown as a generally active, broadly available program — its "Program Status" column says "${truncate(program.status)}."`,
    rowNumber: program.rowNumber,
  };
}

/**
 * Scores a program's relevance to a situation, for ranking among programs
 * that already passed isProgramRelevant and hasPersonalizedMatch. Only used
 * for ordering — the sheet's eligibility columns are prose, so a low score
 * alone isn't reason enough to exclude a program on its own.
 */
export function scoreAidProgram(program: SheetAidProgram, situation: Partial<UserSituation>): number {
  let score = 1;

  // Generic "this program is even active/reachable" signals — kept low-weight
  // on purpose so they don't drown out the personalized matches below; almost
  // every surviving program is active and broadly available, so weighting
  // these heavily would flatten the ranking instead of sharpening it.
  const status = program.status.toLowerCase();
  if (status.includes("active")) score += 1;
  if (status.includes("closed") || status.includes("inactive") || status.includes("expired")) score -= 3;

  // This app is North Carolina/Hurricane Helene-focused, so bias toward
  // programs that are nationwide or explicitly serve NC.
  const state = program.state.toLowerCase();
  if (state.includes("nationwide") || state.includes("all ") || state.includes("north carolina") || /\bnc\b/.test(state)) {
    score += 1;
  }

  const county = situation.county?.toLowerCase().trim();
  const eligibleCounties = program.eligibleCounties.toLowerCase();
  if (eligibleCounties.includes("all")) {
    score += 1;
  } else if (county && eligibleCounties.includes(county)) {
    score += 5;
  }

  if (program.mustBeInDeclaredDisasterArea.toLowerCase().startsWith("no")) {
    score += 1;
  }

  const requiresPrimaryResidence = program.primaryResidenceOnly.toLowerCase().startsWith("yes");
  if (requiresPrimaryResidence) {
    score += situation.disasterAtThisAddress === false ? -2 : 1;
  }

  // Personalized signals — weighted heavily since these are what should
  // actually separate "a good match" from "just a generic active program."
  const corpus = matchableText(program);
  for (const category of needCategoriesOf(situation)) {
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords && includesAny(corpus, keywords)) {
      score += 5;
    }
  }

  const ownershipText = program.homeownerRenterRequirements.toLowerCase();
  if (situation.ownershipStatus === "owner" || situation.housingStatus === "homeowner") {
    if (ownershipText.includes("owner") || ownershipText.includes("homeowner")) score += 2;
  }
  if (situation.ownershipStatus === "renter" || situation.housingStatus === "renter") {
    if (ownershipText.includes("renter") || ownershipText.includes("tenant")) score += 2;
  }

  if (situation.isFarmer || situation.applicantCategory === "farmer") {
    if (includesAny(corpus, CATEGORY_KEYWORDS.agricultural) || includesAny(program.agency, ["agricult", "usda", "farm"])) {
      score += 3;
    }
  }

  return score;
}

/**
 * Hard-excludes a program only on explicit, unambiguous conflicts — not on
 * a field simply being blank or vague, since the sheet's prose is inconsistent
 * enough that "missing" isn't the same as "doesn't apply."
 */
export function isProgramRelevant(program: SheetAidProgram, situation: Partial<UserSituation>): boolean {
  const status = program.status.toLowerCase();
  if (status.includes("closed") || status.includes("inactive") || status.includes("expired") || status.includes("discontinued")) {
    return false;
  }

  const requiresPrimaryResidence = program.primaryResidenceOnly.toLowerCase().startsWith("yes");
  if (requiresPrimaryResidence && situation.disasterAtThisAddress === false) {
    return false;
  }

  // Note: geography ("Eligible Counties"/"State") and category/damage-type
  // were tried as hard filters too, but real sheet data proved them unsafe —
  // e.g. FEMA's Individuals and Households Program and the National Flood
  // Insurance Program both got wrongly excluded for an ordinary NC homeowner,
  // because those columns use conditional/declaration-dependent phrasing
  // ("Declared disaster states only", "Varies by declaration"). Both still
  // count toward scoreAidProgram/hasPersonalizedMatch instead.

  if (situation.isFarmer === false) {
    const applicantTypeText = program.eligibleApplicantTypes.toLowerCase();
    const isFarmOnly = includesAny(applicantTypeText, CATEGORY_KEYWORDS.agricultural)
      && !includesAny(applicantTypeText, ["general public", "individual", "household", "family", "resident"]);
    if (isFarmOnly) return false;
  }

  return true;
}

/** True if the situation actually says anything specific enough to judge relevance against. */
function hasAnySituationSignal(situation: Partial<UserSituation>): boolean {
  return Boolean(
    needCategoriesOf(situation).length > 0
    || situation.county
    || situation.ownershipStatus
    || situation.housingStatus
    || situation.isFarmer !== undefined
    || situation.applicantCategory,
  );
}

/**
 * True if this program matched something specific about the situation —
 * a need category, county, ownership status, or farm status — as opposed to
 * just being generically active/available. Once the user has answered enough
 * to have any signal at all, results are limited to programs that clear this
 * bar, so a category like childcare doesn't get crowded out by generic
 * programs that merely out-scored it on baseline points.
 */
export function hasPersonalizedMatch(program: SheetAidProgram, situation: Partial<UserSituation>): boolean {
  const corpus = matchableText(program);

  for (const category of needCategoriesOf(situation)) {
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords && includesAny(corpus, keywords)) return true;
  }

  const county = situation.county?.toLowerCase().trim();
  if (county && program.eligibleCounties.toLowerCase().includes(county)) return true;

  const ownershipText = program.homeownerRenterRequirements.toLowerCase();
  if ((situation.ownershipStatus === "owner" || situation.housingStatus === "homeowner")
    && (ownershipText.includes("owner") || ownershipText.includes("homeowner"))) return true;
  if ((situation.ownershipStatus === "renter" || situation.housingStatus === "renter")
    && (ownershipText.includes("renter") || ownershipText.includes("tenant"))) return true;

  if ((situation.isFarmer || situation.applicantCategory === "farmer")
    && (includesAny(corpus, CATEGORY_KEYWORDS.agricultural) || includesAny(program.agency, ["agricult", "usda", "farm"]))) return true;

  return false;
}

export interface RankedAidProgram {
  program: SheetAidProgram;
  score: number;
  matchReason: MatchExplanation;
}

export function rankAidPrograms(programs: SheetAidProgram[], situation: Partial<UserSituation>): RankedAidProgram[] {
  const relevant = programs.filter(program => isProgramRelevant(program, situation));
  const scored = relevant.map(program => ({
    program,
    score: scoreAidProgram(program, situation),
    matchReason: explainMatch(program, situation),
  }));

  // Once the user has given us anything to personalize against, only show
  // programs that actually matched it — never pad the list with generic
  // programs just to reach a round number.
  const candidates = hasAnySituationSignal(situation)
    ? scored.filter(({ program }) => hasPersonalizedMatch(program, situation))
    : scored;

  return candidates.sort((a, b) => b.score - a.score);
}
