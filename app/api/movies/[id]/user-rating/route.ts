import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { userRatings, users, movie } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server'; // Ensure correct import

// Zod schema for POST request validation
const postRatingSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

// GET handler
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth(); // Removed 'request' argument

  if (!userId) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { message: 'Missing movie ID' },
      { status: 400 }
    );
  }

  try {
    const ratingRecord = await db
      .select()
      .from(userRatings)
      .where(
        and(
          eq(userRatings.userId, userId),
          eq(userRatings.movieId, Number(id))
        )
      )
      .execute();

    const rating = ratingRecord.length > 0 ? ratingRecord[0].rating : null;
    return NextResponse.json({ rating }, { status: 200 });
  } catch (error) {
    console.error('Error fetching rating:', (error as Error).message);
    return NextResponse.json(
      { message: 'Error fetching rating' },
      { status: 500 }
    );
  }
}

// POST handler to add or update a user's rating for a specific movie
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth(); // Removed 'request' argument

  if (!userId) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { message: 'Missing movie ID' },
      { status: 400 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { message: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const parseResult = postRatingSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { message: 'Invalid input', errors: parseResult.error.errors },
      { status: 400 }
    );
  }

  const { rating } = parseResult.data;

  try {
    const movieId = Number(id);
    if (isNaN(movieId)) {
      return NextResponse.json(
        { message: 'Invalid movie ID' },
        { status: 400 }
      );
    }

    // Verify that the movie exists
    const movieExists = await db
      .select()
      .from(movie)
      .where(eq(movie.id, movieId))
      .execute();

    if (movieExists.length === 0) {
      return NextResponse.json(
        { message: 'Movie does not exist' },
        { status: 400 }
      );
    }

    // Check if the user exists in the 'users' table
    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .execute();

    if (userExists.length === 0) {
      // Optionally, fetch additional user info from Clerk
      // For simplicity, we'll insert only the 'id' here
      await db.insert(users).values({
        id: userId,
        name: '', // Populate with actual data if available
        email: '', // Populate with actual data if available
        // Add other fields as necessary
      }).execute();
    }

    // Upsert the user rating
    const result = await db
      .insert(userRatings)
      .values({
        userId: userId,
        movieId: movieId,
        rating: rating,
        // 'timestamp' defaults to now()
      })
      .onConflictDoUpdate({
        target: [userRatings.userId, userRatings.movieId],
        set: {
          rating: rating,
          timestamp: new Date(),
        },
      })
      .returning();

    console.log(`User ${userId} rated movie ${movieId} with ${rating}`);

    return NextResponse.json(
      { message: 'Rating updated successfully!', data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating rating:', (error as Error).message);
    return NextResponse.json(
      { error: 'Error updating rating' },
      { status: 500 }
    );
  }
}
