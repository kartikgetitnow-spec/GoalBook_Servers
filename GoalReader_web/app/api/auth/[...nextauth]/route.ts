import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: userId,
        email: user?.emailAddresses?.[0]?.emailAddress || null,
        firstName: user?.firstName || null,
        lastName: user?.lastName || null,
        imageUrl: user?.imageUrl || null,
      }
    });
  } catch (error) {
    console.error('Auth endpoint error:', error);
    return NextResponse.json({ error: 'Auth session lookup error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return NextResponse.json({ message: 'Auth endpoint ready' }, { status: 200 });
}
