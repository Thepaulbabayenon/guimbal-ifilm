import { db } from "@/app/db/drizzle";
import { userRatings, users } from "@/app/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

// Helper function to validate film IDs
const validateFilmIds = (filmIds: string[] | string | null): number[] => {
  if (!filmIds) return [];
  if (typeof filmIds === "string") filmIds = [filmIds]; // Ensure array format
  return filmIds
    .map((id) => parseInt(id))
    .filter((id) => !isNaN(id)); // Filter valid numbers
};

// GET request to fetch user ratings for multiple films
export async function GET(req: Request) {
  console.log("Received GET request for user ratings");

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const filmIdsParam = url.searchParams.getAll("filmIds[]"); // Ensure this works with your query format

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
      .filter((id) => !isNaN(id)); // Ensure all IDs are valid numbers

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
          inArray(userRatings.filmId, validFilmIds) // Use inArray instead of sql string
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



// POST request to save/update multiple user ratings
export async function POST(req: Request) {
  console.log("Received POST request to update user ratings");

  try {
    const { userId, ratings } = await req.json();

    console.log("User ID:", userId);
    console.log("Ratings:", ratings);

    // Validate input
    if (!userId || !Array.isArray(ratings) || ratings.length === 0) {
      return NextResponse.json({ error: "Invalid user ID or ratings data" }, { status: 400 });
    }

    // Validate each rating object
    for (const { filmId, rating } of ratings) {
      if (!filmId || isNaN(parseInt(filmId)) || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "Invalid film ID or rating value" }, { status: 400 });
      }
    }

    // Ensure user exists
    const userExists = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update or insert ratings
    for (const { filmId, rating } of ratings) {
      const existingRating = await db.query.userRatings.findFirst({
        where: and(eq(userRatings.userId, userId), eq(userRatings.filmId, parseInt(filmId))),
      });

      if (existingRating) {
        // Update existing rating
        await db.update(userRatings).set({ rating }).where(eq(userRatings.id, existingRating.id));
      } else {
        // Insert new rating
        await db.insert(userRatings).values({ userId, filmId: parseInt(filmId), rating });
      }
    }

    return NextResponse.json({ message: "Ratings updated successfully" });
  } catch (error) {
    console.error("Error saving ratings:", error);
    return NextResponse.json({ error: "Failed to save ratings" }, { status: 500 });
  }
}
