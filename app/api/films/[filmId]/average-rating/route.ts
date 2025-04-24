import { db } from "@/app/db/drizzle";
import { userRatings, film } from "@/app/db/schema";
import { eq, avg } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { filmId: string } }
) {
  try {
    // Fix: Properly await params before accessing properties
    const { filmId: filmIdParam } = await params;
    const filmId = parseInt(filmIdParam, 10);

    if (isNaN(filmId) || filmId <= 0) {
      return NextResponse.json(
        { error: "Invalid filmId provided" },
        { status: 400 }
      );
    }

    // Calculate the average rating for the specific film
    const result = await db
      .select({
        averageRating: avg(userRatings.rating).mapWith(Number),
      })
      .from(userRatings)
      .where(eq(userRatings.filmId, filmId));

    const averageRating = result[0]?.averageRating ?? 0;

    // Update the averageRating field for this specific film
    await db
      .update(film)
      .set({ averageRating })
      .where(eq(film.id, filmId));

    return NextResponse.json({ averageRating });

  } catch (error) {
    console.error(`Error processing average rating for filmId ${params.filmId}:`, error);
    return NextResponse.json(
      { error: "Failed to calculate average rating" },
      { status: 500 }
    );
  }
}