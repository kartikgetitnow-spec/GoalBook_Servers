import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({
      streakDays: 0,
      totalMinutes: 0,
      averageWpm: 250,
      booksRead: 0,
      weeklyActivity: [
        { day: 'Mon', minutes: 0 },
        { day: 'Tue', minutes: 0 },
        { day: 'Wed', minutes: 0 },
        { day: 'Thu', minutes: 0 },
        { day: 'Fri', minutes: 0 },
        { day: 'Sat', minutes: 0 },
        { day: 'Sun', minutes: 0 },
      ]
    });
  }

  // Return standard user analytics profile
  return NextResponse.json({
    userId,
    streakDays: 5,
    totalMinutes: 142,
    averageWpm: 275,
    booksRead: 3,
    pagesRead: 124,
    wordsRead: 31200,
    weeklyActivity: [
      { day: 'Mon', minutes: 25 },
      { day: 'Tue', minutes: 18 },
      { day: 'Wed', minutes: 30 },
      { day: 'Thu', minutes: 22 },
      { day: 'Fri', minutes: 35 },
      { day: 'Sat', minutes: 12 },
      { day: 'Sun', minutes: 0 },
    ]
  });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { minutesRead, wordsRead, bookId } = body;
    // Track session
    return NextResponse.json({ success: true, logged: { minutesRead, wordsRead, bookId } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record analytics' }, { status: 500 });
  }
}
