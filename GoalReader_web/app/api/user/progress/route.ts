import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ progress: null });
  }

  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('bookId');

  return NextResponse.json({
    userId,
    bookId,
    lastPage: 1,
    lastSentenceIndex: 0,
    lastWordIndex: 0,
    percentage: 0,
    updatedAt: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookId, page, sentenceIndex, wordIndex, percentage } = body;

    return NextResponse.json({
      success: true,
      progress: {
        userId,
        bookId,
        page,
        sentenceIndex,
        wordIndex,
        percentage,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
