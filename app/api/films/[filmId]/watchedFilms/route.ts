import { db } from '@/db/drizzle';
import { watchedFilms } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Request Body:', body);  // Log the request body for debugging

    const { userId, filmId } = body;

    // Check if both userId and filmId are present
    if (!userId || !filmId) {
      return NextResponse.json({ error: 'userId and filmId are required' }, { status: 400 });
    }

    await db.insert(watchedFilms).values({
      userId,
      filmId,
    });

    return NextResponse.json({ message: 'Film marked as watched' }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to mark film as watched' }, { status: 500 });
  }
}
