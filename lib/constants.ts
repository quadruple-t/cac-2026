import type { DamageType } from "./types";

// Counties covered by the Hurricane Helene major disaster declaration in
// western North Carolina. Kept here so the intake form and data stay in sync.
export const NC_COUNTIES: string[] = [
  "Alexander",
  "Alleghany",
  "Ashe",
  "Avery",
  "Buncombe",
  "Burke",
  "Caldwell",
  "Catawba",
  "Clay",
  "Cleveland",
  "Gaston",
  "Haywood",
  "Henderson",
  "Jackson",
  "Lincoln",
  "Macon",
  "Madison",
  "McDowell",
  "Mitchell",
  "Polk",
  "Rutherford",
  "Swain",
  "Transylvania",
  "Watauga",
  "Wilkes",
  "Yancey",
];

export const DAMAGE_TYPES: { value: DamageType; label: string }[] = [
  { value: "flood", label: "Flooding / water damage" },
  { value: "wind", label: "Wind damage" },
  { value: "structural", label: "Structural / home damage" },
  { value: "personal-property", label: "Personal property loss" },
  { value: "vehicle", label: "Vehicle damage" },
  { value: "business", label: "Business / lost income" },
  { value: "agricultural", label: "Farm / agricultural loss" },
];

// Income brackets shown in the form. `value` is the lower bound of the bracket,
// which the matching logic uses so we never wrongly exclude a lower-income
// household from an income-limited program. `null` means "prefer not to say".
export const INCOME_BRACKETS: { value: number | null; label: string }[] = [
  { value: 0, label: "Under $25,000" },
  { value: 25000, label: "$25,000 – $50,000" },
  { value: 50000, label: "$50,000 – $75,000" },
  { value: 75000, label: "$75,000 – $100,000" },
  { value: 100000, label: "Over $100,000" },
  { value: null, label: "Prefer not to say" },
];
