import { db } from "@/app/db/drizzle";
import { userRatings, users, film } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// Helper function to validate userId and filmId
const validateFilmId = (filmId: string) => {
  const parsedFilmId = parseInt(filmId);
  return !isNaN(parsedFilmId) ? parsedFilmId : null;
};

// GET request to fetch user's rating for a specific film
export async function GET(
  req: Request,
  { params }: { params: { filmId: string } }
) {
  console.log("Received GET request for filmId:", params.filmId);

  try {
    // Validate and parse filmId
    const filmId = validateFilmId(params.filmId);
    if (!filmId) {
      return NextResponse.json({ error: "Invalid film ID" }, { status: 400 });
    }

    // Get the userId from the query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    console.log("User ID:", userId);

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Ensure user exists in the database
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch the user's rating for the film
    const userRating = await db.query.userRatings.findFirst({
      where: and(eq(userRatings.userId, userId), eq(userRatings.filmId, filmId)),
    });

    if (!userRating) {
      return NextResponse.json({ error: "Rating not found for this film" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Rating fetched successfully",
      rating: userRating.rating,
    });
  } catch (error) {
    const errorMessage = (error as Error).message || "Unknown error";
    console.error("Error fetching rating:", errorMessage);

    return NextResponse.json(
      { error: "Failed to fetch rating", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST request to save or update the user's rating for a specific film
export async function POST(
  req: Request,
  { params }: { params: { filmId: string } }
) {
  console.log("Received POST request for filmId:", params.filmId);

  try {
    // Validate and parse filmId
    const filmId = validateFilmId(params.filmId);
    if (!filmId) {
      return NextResponse.json({ error: "Invalid film ID" }, { status: 400 });
    }

    // Parse JSON body to get userId and rating
    const { userId, rating } = await req.json();
    console.log("User ID:", userId);
    console.log("Rating:", rating);

    // Ensure userId and rating are provided
    if (!userId || rating === undefined) {
      return NextResponse.json({ error: "User ID and rating are required" }, { status: 400 });
    }

    // Validate rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Ensure user exists
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for an existing rating for this user and film
    const existingRating = await db.query.userRatings.findFirst({
      where: and(eq(userRatings.userId, userId), eq(userRatings.filmId, filmId)),
    });

    if (existingRating) {
      // Update the rating if it already exists
      await db.update(userRatings).set({ rating }).where(eq(userRatings.id, existingRating.id));
      console.log("Updated existing rating for filmId:", filmId);
    } else {
      // Insert new rating if no existing rating found
      await db.insert(userRatings).values({ userId, filmId, rating });
      console.log("Inserted new rating for filmId:", filmId);
    }

    // Fetch the updated rating for the film
    const updatedRating = await db.query.userRatings.findFirst({
      where: and(eq(userRatings.userId, userId), eq(userRatings.filmId, filmId)),
    });

    return NextResponse.json({
      message: "Rating saved successfully",
      rating: updatedRating?.rating || rating, // Return the updated rating
    });
  } catch (error) {
    const errorMessage = (error as Error).message || "Unknown error";
    const errorStack = (error as Error).stack || "No stack trace available";
    console.error("Error saving rating:", errorMessage);
    console.error("Error stack:", errorStack);

    return NextResponse.json(
      { error: "Failed to save rating", details: errorMessage },
      { status: 500 }
    );
  }
}
