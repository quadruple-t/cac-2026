import { NextRequest, NextResponse } from 'next/server';
import { saveUserSituation, getUserSituation, deleteUserSituation } from '@/lib/firestore/user-situations';
import { getCurrentUser } from '@/lib/firebase/session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const situation = await getUserSituation(user.uid);
    return NextResponse.json({ situation });
  } catch (error) {
    console.error('Error fetching user situation:', error);
    return NextResponse.json({ error: 'Failed to fetch user situation' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const situation = await request.json();
    const docId = await saveUserSituation(user.uid, situation);
    return NextResponse.json({ id: docId });
  } catch (error) {
    console.error('Error saving user situation:', error);
    return NextResponse.json({ error: 'Failed to save user situation' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteUserSituation(user.uid);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user situation:', error);
    return NextResponse.json({ error: 'Failed to delete user situation' }, { status: 500 });
  }
}
