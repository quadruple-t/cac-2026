import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { savePinnedPrograms, getPinnedPrograms, deletePinnedPrograms } from '@/lib/firestore/pinned-programs';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { programIds, programs } = await getPinnedPrograms(user.uid);
    return NextResponse.json({ programIds, programs });
  } catch (error) {
    console.error('Error in GET /api/pinned-programs:', error);
    return NextResponse.json({ error: 'Failed to fetch pinned programs', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { programIds, programs } = await request.json();
    if (!Array.isArray(programIds) || !programIds.every((id) => typeof id === 'string')) {
      return NextResponse.json({ error: 'programIds must be an array of strings' }, { status: 400 });
    }
    // Only keep snapshots for ids that are still pinned.
    const snapshots = Array.isArray(programs)
      ? programs.filter((p) => p && typeof p.id === 'string' && programIds.includes(p.id))
      : [];
    await savePinnedPrograms(user.uid, programIds, snapshots);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/pinned-programs:', error);
    return NextResponse.json({ error: 'Failed to save pinned programs', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deletePinnedPrograms(user.uid);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/pinned-programs:', error);
    return NextResponse.json({ error: 'Failed to delete pinned programs', details: String(error) }, { status: 500 });
  }
}
