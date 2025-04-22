import { db } from "@/app/db/drizzle";
import { userRatings, film } from "@/app/db/schema";
import { eq, avg } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { filmId: string } }
  // Note: No 'await' needed for params in App Router Route Handlers
) {
  try {
    const filmIdParam = params.filmId; // Directly access params
    const filmId = parseInt(filmIdParam, 10); // Add radix 10 for clarity

    if (isNaN(filmId) || filmId <= 0) { // Added check for non-positive IDs
      return NextResponse.json(
        { error: "Invalid filmId provided" },
        { status: 400 }
      );
    }

    // --- Step 1: Calculate the average rating for the specific film ---
    // Ensure you have a database index on userRatings.filmId for performance!
    const result = await db
      .select({
        averageRating: avg(userRatings.rating).mapWith(Number), // mapWith(Number) directly casts the avg result
      })
      .from(userRatings)
      .where(eq(userRatings.filmId, filmId));

    // Use optional chaining and nullish coalescing for safer access and default
    const averageRating = result[0]?.averageRating ?? 0;

    // --- Step 2: Update the averageRating field for this specific film ---
    // This is relatively fast as it targets a single row by its indexed ID.
    // Consider if you *really* need to do this synchronously here.
    // If many rating updates happen quickly, this could still be a bottleneck.
    // It might be better handled by the same background job that does ranking.
    // However, for simplicity now, we keep it.
    await db
      .update(film)
      .set({ averageRating: averageRating }) // Can use shorthand { averageRating }
      .where(eq(film.id, filmId));

    // --- Step 3: Return the calculated average rating ---
    // Ranking logic has been REMOVED from this endpoint for performance.
    // It should be handled by a separate, periodic background job/worker
    // that calculates ranks for all films efficiently (e.g., using database functions).

    return NextResponse.json({ averageRating });

  } catch (error) {
    console.error(`Error processing average rating for filmId ${params.filmId}:`, error);
    // Log the specific filmId for better debugging
    return NextResponse.json(
      { error: "Failed to calculate average rating" },
      { status: 500 }
    );
  }
}