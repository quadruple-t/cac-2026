import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { getAidProgramsFromSheet, getSheetRowUrl } from '@/lib/sheets/aid-programs-sheet';
import { rankAidPrograms } from '@/lib/sheets/aid-programs-matching';
import type { UserSituation } from '@/lib/aid-programs';

// Keeps the dashboard to a short, actually-actionable list instead of
// dumping most of the 147-program sheet on the user.
const MAX_RESULTS = 10;

/** Ranks the Google Sheet's program database against a situation. POST (not GET) since the situation is sent in the body. */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const situation = (await request.json()) as Partial<UserSituation>;
    const programs = await getAidProgramsFromSheet();
    const ranked = rankAidPrograms(programs, situation)
      .slice(0, MAX_RESULTS)
      // Resolve the row number into an actual sheet URL, and only send the
      // program fields the client adapter actually uses — the client bundle
      // can't import aid-programs-sheet.ts (it's server-only) and doesn't
      // need the other ~40 raw sheet columns.
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
        },
        score,
        matchReason: { sentence: matchReason.sentence, sourceUrl: getSheetRowUrl(matchReason.rowNumber) },
      }));
    return NextResponse.json({ programs: ranked });
  } catch (error) {
    console.error('Error ranking aid programs:', error);
    return NextResponse.json({ error: 'Failed to load aid programs' }, { status: 500 });
  }
}
