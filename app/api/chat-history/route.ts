import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { saveChatHistory, getChatHistory, deleteChatHistory } from '@/lib/firestore/chat-history';

export async function GET(request: NextRequest) {
  const auth = getAdminAuth();
  const session = await auth.verifySessionCookie(request.cookies.get('session')?.value || '');
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const messages = await getChatHistory(session.uid);
  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const auth = getAdminAuth();
  const session = await auth.verifySessionCookie(request.cookies.get('session')?.value || '');
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { messages } = await request.json();
  await saveChatHistory(session.uid, messages);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const auth = getAdminAuth();
  const session = await auth.verifySessionCookie(request.cookies.get('session')?.value || '');
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await deleteChatHistory(session.uid);
  return NextResponse.json({ success: true });
}
