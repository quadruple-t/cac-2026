import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { saveChatHistory, getChatHistory } from '@/lib/firestore/chat-history';

export async function GET(request: NextRequest) {
  try {
    const auth = getAdminAuth();
    const session = await auth.verifySessionCookie(request.cookies.get('session')?.value || '');
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await getChatHistory(session.uid);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAdminAuth();
    const session = await auth.verifySessionCookie(request.cookies.get('session')?.value || '');
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await request.json();
    
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    await saveChatHistory(session.uid, messages);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving chat history:', error);
    return NextResponse.json({ error: 'Failed to save chat history' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = getAdminAuth();
    const session = await auth.verifySessionCookie(request.cookies.get('session')?.value || '');
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deleteChatHistory } = await import('@/lib/firestore/chat-history');
    await deleteChatHistory(session.uid);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat history:', error);
    return NextResponse.json({ error: 'Failed to delete chat history' }, { status: 500 });
  }
}
