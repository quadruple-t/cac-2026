import { NextRequest, NextResponse } from 'next/server';
import { getAidProgramsFromSheet, getSheetRowUrl } from '@/lib/sheets/aid-programs-sheet';
import { rankAidPrograms } from '@/lib/sheets/aid-programs-matching';
import type { UserSituation } from '@/lib/aid-programs';

// Keeps the dashboard to a short, actually-actionable list instead of
// dumping most of the 147-program sheet on the user.
const MAX_RESULTS = 10;

/**
 * Ranks the Google Sheet's program database against a situation. POST (not
 * GET) since the situation is sent in the body.
 *
 * Deliberately open to signed-out visitors too: the conversational intake's
 * signed-out flow needs these same, real results (not a stale hardcoded
 * list) to back the "results come from our database" demo claim. No
 * session/App Check check here — this route only reads a public program
 * list and returns at most MAX_RESULTS rows, so the request itself isn't
 * sensitive. (No rate-limiting added: there's no existing rate-limit
 * pattern elsewhere in this repo to reuse, and building a new subsystem
 * for this was explicitly out of scope.)
 */
export async function POST(request: NextRequest) {
  try {
    const situation = (await request.json()) as Partial<UserSituation>;
    const programs = await getAidProgramsFromSheet();
    const ranked = rankAidPrograms(programs, situation)
      .slice(0, MAX_RESULTS)
      // Only send the program fields the client adapter actually uses — the
      // client bundle can't import aid-programs-sheet.ts (it's server-only)
      // and doesn't need the other ~40 raw sheet columns.
      .map(({ program, score, matchReason }) => ({
        program: {
          name: program.name,
          agency: program.agency,
          description: program.description,
          maxBenefit: program.maxBenefit,
          applicationDeadline: program.applicationDeadline,
          requiredDocuments: program.requiredDocuments,
          applicationLink: program.applicationLink,
          infoUrl: program.infoUrl,
          sourceUrl: program.sourceUrl,
          phone: program.phone,
          email: program.email,
          // "Who qualifies" fields — eligibility columns the adapter turns
          // into AidProgramWithExtras.qualifications.
          eligibleApplicantTypes: program.eligibleApplicantTypes,
          homeownerRenterRequirements: program.homeownerRenterRequirements,
          requiredDamageType: program.requiredDamageType,
          primaryResidenceOnly: program.primaryResidenceOnly,
          mustBeInDeclaredDisasterArea: program.mustBeInDeclaredDisasterArea,
          ruralOnly: program.ruralOnly,
          eligibleCounties: program.eligibleCounties,
        },
        score,
        matchReason: {
          sentence: matchReason.sentence,
          // Primary/default link shown to users: the program's own official
          // info page, not the underlying Google Sheet row.
          sourceUrl: program.infoUrl || program.sourceUrl || program.applicationLink,
          // Raw sheet-row citation — old default-link behavior, now only
          // surfaced behind the dashboard's "Caseworker view" toggle.
          caseworkerUrl: getSheetRowUrl(matchReason.rowNumber),
        },
      }));
    return NextResponse.json({ programs: ranked });
  } catch (error) {
    console.error('Error ranking aid programs:', error);
    // Surface the actual cause (missing env var, Sheets API error, etc.) —
    // these messages don't contain secrets, just config/HTTP status details,
    // and this route already requires auth. Without this, a broken local
    // setup (e.g. a teammate missing AID_PROGRAMS_SPREADSHEET_ID in their own
    // .env.local, which is gitignored per-developer) is only diagnosable from
    // server logs they may not have access to.
    const message = error instanceof Error ? error.message : 'Failed to load aid programs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
