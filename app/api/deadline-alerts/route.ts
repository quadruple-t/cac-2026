import { NextRequest, NextResponse } from 'next/server';
import { disableDeadlineAlert, listDeadlineAlertsForUser, upsertDeadlineAlert } from '@/lib/firestore/deadline-alerts';
import { getCurrentUser } from '@/lib/firebase/session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts = await listDeadlineAlertsForUser(user.uid);
    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching deadline alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch deadline alerts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, programId } = await request.json();
    const alertEmail = typeof email === 'string' && email.trim() ? email.trim() : user.email;
    if (!alertEmail || typeof programId !== 'string') {
      return NextResponse.json({ error: 'Email and programId are required' }, { status: 400 });
    }

    const id = await upsertDeadlineAlert({ uid: user.uid, email: alertEmail, programId });
    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error saving deadline alert:', error);
    return NextResponse.json({ error: 'Failed to save deadline alert' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const programId = request.nextUrl.searchParams.get('programId');
    if (!programId) {
      return NextResponse.json({ error: 'programId is required' }, { status: 400 });
    }

    await disableDeadlineAlert(user.uid, programId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disabling deadline alert:', error);
    return NextResponse.json({ error: 'Failed to disable deadline alert' }, { status: 500 });
  }
}
