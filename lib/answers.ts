import { DAMAGE_TYPES, INCOME_BRACKETS } from "./constants";
import type { DamageType, IntakeAnswers, Ownership } from "./types";

// Serializes intake answers into URL search params so the results dashboard can
// be a shareable, bookmarkable link (and so state survives a refresh).
export function answersToParams(answers: IntakeAnswers): URLSearchParams {
  const params = new URLSearchParams();
  params.set("county", answers.county);
  params.set("ownership", answers.ownerOrRenter);
  params.set("damage", answers.damageType.join(","));
  params.set("income", answers.income === null ? "na" : String(answers.income));
  params.set("bracket", answers.incomeBracket);
  params.set("fema", answers.appliedToFema ? "1" : "0");
  return params;
}

const VALID_DAMAGE = new Set(DAMAGE_TYPES.map((d) => d.value));

// Parses answers back out of search params. Returns null when the required
// fields are missing (e.g. someone visits /results directly).
export function paramsToAnswers(
  params: Record<string, string | string[] | undefined>
): IntakeAnswers | null {
  const county = single(params.county);
  const ownership = single(params.ownership);
  if (!county || (ownership !== "owner" && ownership !== "renter")) {
    return null;
  }

  const damage = single(params.damage) ?? "";
  const damageType = damage
    .split(",")
    .filter((d): d is DamageType => VALID_DAMAGE.has(d as DamageType));

  const incomeRaw = single(params.income);
  const income = incomeRaw && incomeRaw !== "na" ? Number(incomeRaw) : null;
  const incomeBracket =
    single(params.bracket) ??
    INCOME_BRACKETS.find((b) => b.value === income)?.label ??
    "Not provided";

  return {
    county,
    ownerOrRenter: ownership as Ownership,
    damageType,
    income: income !== null && Number.isNaN(income) ? null : income,
    incomeBracket,
    appliedToFema: single(params.fema) === "1",
  };
}

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
