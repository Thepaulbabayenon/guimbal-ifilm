import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';  // Drizzle DB instance
import { userRatings, watchedFilms, userInteractions } from '@/app/db/schema';  // Your schema imports
import { eq, and } from 'drizzle-orm';  // Import eq and logical operators like and

export async function POST(req: NextRequest) {
  try {
    // Check if the database connection is working using Drizzle ORM
    const healthCheck = await db.select().from(userRatings).limit(1).execute();
    if (!healthCheck) {
      console.error('Database connection issue');
      return NextResponse.json({ message: 'Database connection issue.' }, { status: 500 });
    }
    console.log('Database connection is active');

    // Parse the incoming request body
    const body = await req.json();
    const { userId, filmId, rating, isWatched } = body;

    if (!userId || !filmId) {
      return NextResponse.json({ message: 'User ID and Film ID are required.' }, { status: 400 });
    }

    // Log the request data
    console.log('Received data:', { userId, filmId, rating, isWatched });

    // Check if the user has rated the film using logical "and" with eq
    const hasRated = await db
      .select()
      .from(userRatings)
      .where(and(
        eq(userRatings.userId, userId),  // Compare userId
        eq(userRatings.filmId, filmId)   // Compare filmId
      ))
      .execute();

    // Check if the user has watched the film using logical "and" with eq
    const hasWatched = await db
      .select()
      .from(watchedFilms)
      .where(and(
        eq(watchedFilms.userId, userId),  // Compare userId
        eq(watchedFilms.filmId, filmId)   // Compare filmId
      ))
      .execute();

    // Begin transaction for inserting into multiple tables
    await db.transaction(async (trx) => {
      if (rating !== undefined) {
        // Validate the rating input
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
          throw new Error('Rating must be a number between 1 and 5.');
        }

        if (hasRated.length === 0) {
          console.log('Inserting user rating:', { userId, filmId, rating });
          await trx.insert(userRatings).values({
            userId,
            filmId,
            rating,
            timestamp: new Date(),
          });
        }
      }

      if (isWatched !== undefined) {
        // Validate the isWatched input
        if (typeof isWatched !== 'boolean') {
          throw new Error('isWatched must be a boolean.');
        }

        if (hasWatched.length === 0) {
          console.log('Inserting watched status:', { userId, filmId });
          await trx.insert(watchedFilms).values({
            userId,
            filmId,
            timestamp: new Date(),
          });
        }
      }
    });

    console.log('User interaction recorded successfully');
    return NextResponse.json({ message: 'User interaction recorded successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error while processing request:', error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'An error occurred while processing the request.' }, { status: 500 });
  }
}
