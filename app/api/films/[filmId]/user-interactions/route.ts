import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { userRatings, watchedFilms, userInteractions } from '@/app/db/schema'; 
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
  
    const healthCheck = await db.select().from(userRatings).limit(1).execute();
    if (!healthCheck) {
      console.error('Database connection issue');
      return NextResponse.json({ message: 'Database connection issue.' }, { status: 500 });
    }
    console.log('Database connection is active');


    const body = await req.json();
    const { userId, filmId, rating, isWatched } = body;

    if (!userId || !filmId) {
      return NextResponse.json({ message: 'User ID and Film ID are required.' }, { status: 400 });
    }

   
    console.log('Received data:', { userId, filmId, rating, isWatched });

    
    const hasRated = await db
      .select()
      .from(userRatings)
      .where(and(
        eq(userRatings.userId, userId),  
        eq(userRatings.filmId, filmId)   
      ))
      .execute();

   
    const hasWatched = await db
      .select()
      .from(watchedFilms)
      .where(and(
        eq(watchedFilms.userId, userId), 
        eq(watchedFilms.filmId, filmId) 
      ))
      .execute();

   
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
            createdAt: new Date(),
          });
          
        }
      }

      if (isWatched !== undefined) {
       
        if (typeof isWatched !== 'boolean') {
          throw new Error('isWatched must be a boolean.');
        }

        if (hasWatched.length === 0) {
          console.log('Inserting watched status:', { userId, filmId });
          await trx.insert(watchedFilms).values({
            userId,
            filmId,
            watchedAt: new Date(),
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
