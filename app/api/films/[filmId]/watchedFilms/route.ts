import { db } from '@/db/drizzle';
import { userRatings, watchedFilms, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Request Body:', body);  // Debug log

    const { userId, filmId, rating } = body;

    // Validate input
    if (!userId || !filmId || rating === undefined) {
      return NextResponse.json(
        { error: 'userId, filmId, and rating are required' }, 
        { status: 400 }
      );
    }

    // Validate that the rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' }, 
        { status: 400 }
      );
    }

    // Ensure user exists in the database
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for an existing rating for this user and film
    const existingRating = await db.query.userRatings.findFirst({
      where: and(eq(userRatings.userId, userId), eq(userRatings.filmId, filmId)),
    });

    if (existingRating) {
      // Update the existing rating
      await db.update(userRatings).set({ rating }).where(eq(userRatings.id, existingRating.id));
      console.log("Updated existing rating for filmId:", filmId);
    } else {
      // Insert a new rating
      await db.insert(userRatings).values({
        userId,
        filmId,
        rating,
      });
      console.log("Inserted new rating for filmId:", filmId);
    }

    // After rating, mark the film as watched
    // Check if the film has already been marked as watched
    const alreadyWatched = await db.query.watchedFilms.findFirst({
      where: eq(watchedFilms.userId, userId) && eq(watchedFilms.filmId, filmId),
    });

    if (!alreadyWatched) {
      // Insert into watchedFilms if not already marked as watched
      await db.insert(watchedFilms).values({
        userId,
        filmId,
        timestamp: new Date(),  // Insert current timestamp
      });
      console.log("Inserted film into watchedFilms table:", filmId);
    }

    return NextResponse.json(
      { message: 'Rating and watch status saved successfully', rating }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to save rating and watch status', details: (error as Error).message }, 
      { status: 500 }
    );
  }
}
