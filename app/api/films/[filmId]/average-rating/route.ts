import { db } from "@/db/drizzle";
import { userRatings, film } from "@/db/schema";
import { eq, avg, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { filmId: string } }
) {
  try {
    // Calculate the average rating for the film
    const result = await db
      .select({
        averageRating: avg(userRatings.rating),
      })
      .from(userRatings)
      .where(eq(userRatings.filmId, parseInt(params.filmId)));

    // Ensure averageRating is treated as a number (default to 0 if null or undefined)
    const averageRating = Number(result[0]?.averageRating || 0);

    // Update the films table with the new average rating
    await db
      .update(film)
      .set({
        averageRating,
      })
      .where(eq(film.id, parseInt(params.filmId)));

    // Recalculate rankings for all films based on average ratings
    const allFilms = await db.select({ id: film.id, averageRating: film.averageRating }).from(film);

    // Sort films by their average ratings in descending order, handling nulls
    const sortedFilms = allFilms.sort((a, b) =>
      (b.averageRating ?? 0) - (a.averageRating ?? 0)
    );

    // Update rankings based on sorted order (rank starts from 1)
    for (let i = 0; i < sortedFilms.length; i++) {
      await db
        .update(film)
        .set({ rank: i + 1 }) // Assign rank starting from 1
        .where(eq(film.id, sortedFilms[i].id));
    }

    return NextResponse.json({ averageRating });
  } catch (error) {
    console.error("Error calculating average rating or updating rankings:", error);
    return NextResponse.json(
      { error: "Failed to calculate average rating or update rankings" },
      { status: 500 }
    );
  }
}
