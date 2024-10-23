import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { userRatings, users } from '@/db/schema'; // Import the user table schema
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Zod Schemas for validation
const querySchema = z.object({
  userId: z.string().uuid(), // Validates that userId is a valid UUID
});

const bodySchema = z.object({
  userId: z.string().uuid(), // Validates that userId is a valid UUID
  rating: z.number().int().min(1).max(5), // Rating must be an integer between 1 and 5
});

// GET: Fetch user rating for a specific movie
export async function GET(
  request: NextRequest,
  { params }: { params: { movieId: string } }
) {
  const { movieId } = params;

  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = querySchema.safeParse(query);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { userId } = parsed.data;

    // Fetch the user's rating for the movie
    const ratingEntry = await db
      .select()
      .from(userRatings)
      .where(
        and(
          eq(userRatings.userId, userId),
          eq(userRatings.movieId, parseInt(movieId, 10))
        )
      )
      .limit(1);

    if (ratingEntry.length > 0) {
      return NextResponse.json(
        { rating: ratingEntry[0].rating },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'No rating found for this movie' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error in GET /api/movies/[movieId]/user-rating:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST: Add or update a user's rating for a specific movie
export async function POST(
  request: NextRequest,
  { params }: { params: { movieId: string } }
) {
  const { movieId } = params;

  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      console.error('Validation Error:', parsed.error.errors);
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { userId, rating } = parsed.data;

    // Check if the userId exists in the user table
    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the user has already rated this movie
    const existingRating = await db
      .select()
      .from(userRatings)
      .where(
        and(
          eq(userRatings.userId, userId),
          eq(userRatings.movieId, parseInt(movieId, 10))
        )
      )
      .limit(1);

    if (existingRating.length > 0) {
      // Update the rating if it already exists
      await db
        .update(userRatings)
        .set({ rating, timestamp: new Date() })
        .where(
          and(
            eq(userRatings.userId, userId),
            eq(userRatings.movieId, parseInt(movieId, 10))
          )
        )
        .returning();

      return NextResponse.json(
        { message: 'Rating updated successfully' },
        { status: 200 }
      );
    } else {
      // Insert a new rating if no existing rating is found
      await db
        .insert(userRatings)
        .values({
          userId,
          movieId: parseInt(movieId, 10),
          rating,
          timestamp: new Date(),
        })
        .returning();

      return NextResponse.json(
        { message: 'Rating added successfully' },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/movies/[movieId]/user-rating:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
