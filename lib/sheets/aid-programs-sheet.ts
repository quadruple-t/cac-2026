import "server-only";
import { JWT } from "google-auth-library";

const SPREADSHEET_ID = process.env.AID_PROGRAMS_SPREADSHEET_ID;
const SHEET_GID = process.env.AID_PROGRAMS_SHEET_GID;

// Header text in the sheet (row 1), used to look up column values by name
// instead of by index so column reordering in the sheet doesn't break parsing.
const HEADERS = {
  name: "Name of Program",
  agency: "Parent Agency",
  assistanceType: "Assistance Type",
  description: "Official Description",
  applicationLink: "Application Link",
  infoUrl: "Information Page",
  phone: "Phone Number",
  email: "Email",
  status: "Program Status",
  state: "State",
  eligibleCounties: "Eligible Counties",
  eligibleCitiesZip: "Eligible Cities / ZIP Codes",
  ruralOnly: "Rural-Only Requirement",
  mustBeInDeclaredDisasterArea: "Must Be in Declared Disaster Area",
  primaryResidenceOnly: "Primary Residence Only",
  eligibleApplicantTypes: "Eligible Applicant Types",
  homeownerRenterRequirements: "Homeowner / Renter / Lease Requirements",
  requiredDamageType: "Required Damage Type",
  applicationDeadline: "Application Deadline",
  requiredDocuments: "Required Documents",
  maxBenefit: "Maximum Benefit",
  sourceUrl: "Source URL",
} as const;

export interface SheetAidProgram {
  /** Full row keyed by the sheet's exact column headers, for anything not pulled out below. */
  raw: Record<string, string>;
  /** 1-indexed row in the sheet (accounting for the header row), for deep-linking back to the source. */
  rowNumber: number;
  name: string;
  agency: string;
  assistanceType: string;
  description: string;
  applicationLink: string;
  infoUrl: string;
  phone: string;
  email: string;
  status: string;
  state: string;
  eligibleCounties: string;
  eligibleCitiesZip: string;
  ruralOnly: string;
  mustBeInDeclaredDisasterArea: string;
  primaryResidenceOnly: string;
  eligibleApplicantTypes: string;
  homeownerRenterRequirements: string;
  requiredDamageType: string;
  applicationDeadline: string;
  requiredDocuments: string;
  maxBenefit: string;
  sourceUrl: string;
}

function getAuthClient(): JWT {
  const email = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error("FIREBASE_ADMIN_CLIENT_EMAIL/FIREBASE_ADMIN_PRIVATE_KEY are not set");
  }
  return new JWT({
    email,
    key: rawKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

async function sheetsApiFetch(path: string, accessToken: string): Promise<unknown> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    // Revalidate hourly so sheet edits show up without a redeploy, without
    // hitting the Sheets API on every request.
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Sheets API request failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

/** The sheet is referenced by gid (from the tab's URL fragment), but values.get needs the tab's title. */
async function resolveSheetTitle(spreadsheetId: string, gid: string, accessToken: string): Promise<string> {
  const metadata = (await sheetsApiFetch(
    `${spreadsheetId}?fields=sheets.properties`,
    accessToken,
  )) as { sheets: { properties: { sheetId: number; title: string } }[] };

  const match = metadata.sheets.find(sheet => String(sheet.properties.sheetId) === gid);
  if (!match) {
    throw new Error(`No tab with gid ${gid} found in spreadsheet ${spreadsheetId}`);
  }
  return match.properties.title;
}

function field(headers: string[], row: string[], header: string): string {
  return row[headers.indexOf(header)]?.trim() ?? "";
}

function parseRows(headers: string[], rows: string[][]): SheetAidProgram[] {
  return rows
    // Map with the original index first so rowNumber stays correct even
    // after blank rows get filtered out below.
    .map((row, index) => {
      const raw: Record<string, string> = {};
      headers.forEach((header, i) => {
        raw[header] = row[i]?.trim() ?? "";
      });
      return {
        raw,
        rowNumber: index + 2, // +1 for the header row, +1 to make it 1-indexed
        name: field(headers, row, HEADERS.name),
        agency: field(headers, row, HEADERS.agency),
        assistanceType: field(headers, row, HEADERS.assistanceType),
        description: field(headers, row, HEADERS.description),
        applicationLink: field(headers, row, HEADERS.applicationLink),
        infoUrl: field(headers, row, HEADERS.infoUrl),
        phone: field(headers, row, HEADERS.phone),
        email: field(headers, row, HEADERS.email),
        status: field(headers, row, HEADERS.status),
        state: field(headers, row, HEADERS.state),
        eligibleCounties: field(headers, row, HEADERS.eligibleCounties),
        eligibleCitiesZip: field(headers, row, HEADERS.eligibleCitiesZip),
        ruralOnly: field(headers, row, HEADERS.ruralOnly),
        mustBeInDeclaredDisasterArea: field(headers, row, HEADERS.mustBeInDeclaredDisasterArea),
        primaryResidenceOnly: field(headers, row, HEADERS.primaryResidenceOnly),
        eligibleApplicantTypes: field(headers, row, HEADERS.eligibleApplicantTypes),
        homeownerRenterRequirements: field(headers, row, HEADERS.homeownerRenterRequirements),
        requiredDamageType: field(headers, row, HEADERS.requiredDamageType),
        applicationDeadline: field(headers, row, HEADERS.applicationDeadline),
        requiredDocuments: field(headers, row, HEADERS.requiredDocuments),
        maxBenefit: field(headers, row, HEADERS.maxBenefit),
        sourceUrl: field(headers, row, HEADERS.sourceUrl),
      };
    })
    .filter(program => program.name);
}

/** Deep link to a specific row in the sheet, for citing where a match was found. */
export function getSheetRowUrl(rowNumber: number): string {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${SHEET_GID}&range=A${rowNumber}`;
}

export async function getAidProgramsFromSheet(): Promise<SheetAidProgram[]> {
  if (!SPREADSHEET_ID || !SHEET_GID) {
    throw new Error("AID_PROGRAMS_SPREADSHEET_ID/AID_PROGRAMS_SHEET_GID are not set");
  }

  const authClient = getAuthClient();
  const { token } = await authClient.getAccessToken();
  if (!token) {
    throw new Error("Failed to obtain an access token for the Sheets API");
  }

  const title = await resolveSheetTitle(SPREADSHEET_ID, SHEET_GID, token);
  const values = (await sheetsApiFetch(
    `${SPREADSHEET_ID}/values/${encodeURIComponent(title)}`,
    token,
  )) as { values?: string[][] };

  const [headers, ...rows] = values.values ?? [];
  if (!headers) return [];
  return parseRows(headers, rows);
}
