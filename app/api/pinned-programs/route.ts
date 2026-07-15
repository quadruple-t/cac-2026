import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase/session';
import { savePinnedPrograms, getPinnedPrograms, deletePinnedPrograms } from '@/lib/firestore/pinned-programs';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const programIds = await getPinnedPrograms(user.uid);
    return NextResponse.json({ programIds });
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

    const { programIds } = await request.json();
    await savePinnedPrograms(user.uid, programIds);
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
