// /app/api/movies/[movieId]/user-rating/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/db/drizzle';
import { userRatings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Zod Schemas
const querySchema = z.object({
  userId: z.string().uuid(),
});

const bodySchema = z.object({
  userId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
});

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

export async function POST(
  request: NextRequest,
  { params }: { params: { movieId: string } }
) {
  const { movieId } = params;

  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { userId, rating } = parsed.data;

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
