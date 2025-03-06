import { NextResponse } from 'next/server';
import { LastWatchedTime } from '@/types/film'; // Ensure the correct path to your types

// Mock functions to simulate saving and retrieving last watched time
const saveLastWatchedTime = async (userId: string, filmId: number, time: number): Promise<void> => {
  console.log(`Saving last watched time for user ${userId} on film ${filmId}: ${time}s`);
};

const getLastWatchedTime = async (userId: string, filmId: number): Promise<number> => {
  console.log(`Fetching last watched time for user ${userId} on film ${filmId}`);
  return 120; // Mock value
};

// Handle GET requests
export async function GET(
  req: Request,
  { params }: { params: { filmId: string } }
): Promise<NextResponse<LastWatchedTime | { error: string }>> {
  const { filmId } = params;
  const userId = req.headers.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const time = await getLastWatchedTime(userId, Number(filmId));

  return NextResponse.json({
    userId,
    filmId: Number(filmId),
    time,
  });
}


// Handle POST requests
export async function POST(
  req: Request,
  { params }: { params: { filmId: string } }
): Promise<NextResponse<{ message: string } | { error: string }>> {
  const { filmId } = params;
  const userId = req.headers.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const body = await req.json();
  const { time }: { time: number } = body;

  if (typeof time !== 'number') {
    return NextResponse.json({ error: 'Invalid time value' }, { status: 400 });
  }

  await saveLastWatchedTime(userId, Number(filmId), time);
  return NextResponse.json({ message: 'Last watched time saved' });
}
