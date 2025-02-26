import { db } from "@/app/db/drizzle";
import { userRatings, film } from "@/app/db/schema";
import { eq, avg, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { filmId: string } }
) {
  try {
    const filmId = parseInt(params.filmId);

    if (isNaN(filmId)) {
      return NextResponse.json(
        { error: "Invalid filmId" },
        { status: 400 }
      );
    }

    // Calculate the average rating for the film
    const result = await db
      .select({
        averageRating: avg(userRatings.rating),
      })
      .from(userRatings)
      .where(eq(userRatings.filmId, filmId));

    const averageRating = Number(result[0]?.averageRating || 0);

    await db
      .update(film)
      .set({ averageRating })
      .where(eq(film.id, filmId));

    const allFilms = await db.select({ id: film.id, averageRating: film.averageRating }).from(film);

    const sortedFilms = allFilms.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));

    for (let i = 0; i < sortedFilms.length; i++) {
      await db.update(film).set({ rank: i + 1 }).where(eq(film.id, sortedFilms[i].id));
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

