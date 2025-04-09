import { db } from "@/app/db/drizzle";
import { userRatings, users } from "@/app/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Validates and converts film IDs into an array of numbers.
 *
 * @param filmIds - A single film ID (string), an array of film IDs (strings), or null.
 * @returns An array of valid numeric film IDs.
 */
const validateFilmIds = (filmIds: string[] | string | null): number[] => {
  if (!filmIds) return [];


  const idsArray = Array.isArray(filmIds) ? filmIds : [filmIds];

  return idsArray
    .map((id) => Number(id))
    .filter((id) => !isNaN(id) && id > 0);
};



export async function GET(req: Request) {
  console.log("Received GET request for user ratings");

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const filmIdsParam = url.searchParams.getAll("filmIds[]");

    console.log("User ID:", userId);
    console.log("Raw Film IDs:", filmIdsParam);

    // Validate input
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    
    // Ensure user exists
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate filmIds
    const validFilmIds = filmIdsParam
      .map((id) => Number(id))
      .filter((id) => !isNaN(id)); 

    if (validFilmIds.length === 0) {
      return NextResponse.json({
        message: "No valid film IDs provided",
        ratings: [],
      });
    }

    console.log("Validated Film IDs:", validFilmIds);

    // Fetch ratings using sql.in() for proper query execution
    const ratings = await db
      .select()
      .from(userRatings)
      .where(
        and(
          eq(userRatings.userId, userId),
          inArray(userRatings.filmId, validFilmIds)
        )
      );

    return NextResponse.json({
      message: "Ratings fetched successfully",
      ratings,
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}



export async function POST(req: Request, context: { params: { filmId: string } }) {
  console.log("Received POST request to update user ratings");

  try {
    const { userId, rating } = await req.json();
    const filmId = context.params.filmId;

    console.log("User ID:", userId);
    console.log("Rating:", rating);
    console.log("Film ID:", filmId);

    // Validate input
    if (!userId || !filmId || !rating) {
      return NextResponse.json({ error: "Invalid user ID, film ID, or rating data" }, { status: 400 });
    }

    // Validate rating value
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating value" }, { status: 400 });
    }

    // Ensure user exists
    const userExists = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update or insert rating
    const existingRating = await db.query.userRatings.findFirst({
      where: and(eq(userRatings.userId, userId), eq(userRatings.filmId, parseInt(filmId))),
    });

    if (existingRating) {
      // Update existing rating
      await db.update(userRatings)
      .set({ rating })
      .where(and(eq(userRatings.userId, userId), eq(userRatings.filmId, parseInt(filmId))));
    } else {
      // Insert new rating
      await db.insert(userRatings).values({ userId, filmId: parseInt(filmId), rating });
    }

    return NextResponse.json({ success: true, message: "Rating updated successfully" });
  } catch (error) {
    console.error("Error saving rating:", error);
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }
} 