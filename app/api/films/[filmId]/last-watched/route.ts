// app/api/films/[filmId]/last-watched/route.ts
import { NextResponse } from 'next/server';
import { LastWatchedTime } from '@/types/film'; // Ensure the correct path to your types

// Mock functions to simulate saving and retrieving last watched time
const saveLastWatchedTime = async (userId: string, filmId: number, time: number): Promise<void> => {
  console.log(`Saving last watched time for user ${userId} on film ${filmId}: ${time}s`);
};

const getLastWatchedTime = async (userId: string, filmId: number): Promise<number> => {
  console.log(`Fetching last watched time for user ${userId} on film ${filmId}`);
  return 120; // Returning a mock value of 120 seconds
};

// Handle GET requests
export async function GET(req: Request, { params }: { params: { filmId: string } }) {
  const { filmId } = params;
  const userId = req.headers.get('userId'); // Retrieve userId from headers or other means

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const lastWatchedTime = await getLastWatchedTime(userId, Number(filmId));
  return NextResponse.json({ lastWatchedTime });
}

// Handle POST requests
export async function POST(req: Request, { params }: { params: { filmId: string } }) {
  const { filmId } = params;
  const userId = req.headers.get('userId'); // Retrieve userId from headers or other means

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const body = await req.json();
  const { time } = body;

  if (typeof time !== 'number') {
    return NextResponse.json({ error: 'Invalid time value' }, { status: 400 });
  }

  await saveLastWatchedTime(userId, Number(filmId), time);
  return NextResponse.json({ message: 'Last watched time saved' });
}
