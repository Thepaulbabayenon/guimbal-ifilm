import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle'; // Update path to your DB setup
import { userRatings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET: Fetch the user's rating for a movie
export async function GET(req: Request, { params }: { params: { movieId: string } }) {
  const movieId = parseInt(params.movieId);
  const userId = req.headers.get('userId'); // Get user ID from headers (adjust based on your authentication setup)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRating = await db
    .select()
    .from(userRatings)
    .where(and(eq(userRatings.movieId, movieId), eq(userRatings.userId, userId)));

  if (userRating.length > 0) {
    return NextResponse.json({ rating: userRating[0].rating });
  } else {
    return NextResponse.json({ rating: null });
  }
}

// POST: Submit or update a rating for a movie
export async function POST(req: Request, { params }: { params: { movieId: string } }) {
  const movieId = parseInt(params.movieId);
  const userId = req.headers.get('userId'); // Get user ID from headers (adjust based on your authentication setup)
  const { rating } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
  }

  // Check if the user already rated this movie
  const existingRating = await db
    .select()
    .from(userRatings)
    .where(and(eq(userRatings.movieId, movieId), eq(userRatings.userId, userId)));

  if (existingRating.length > 0) {
    // Update the existing rating
    await db
      .update(userRatings)
      .set({ rating, timestamp: new Date() })
      .where(and(eq(userRatings.movieId, movieId), eq(userRatings.userId, userId)));
  } else {
    // Insert a new rating
    await db.insert(userRatings).values({
      userId,
      movieId,
      rating,
      timestamp: new Date(),
    });
  }

  return NextResponse.json({ success: true });
}
