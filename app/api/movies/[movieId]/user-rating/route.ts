import { db } from "@/db/drizzle";
import { userRatings, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { movieId: string } }
) {
  console.log("Received POST request for movieId:", params.movieId);
  console.log("Request method:", req.method);

  try {
    // Parse movieId to ensure it’s a valid number
    const movieId = parseInt(params.movieId);
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: "Invalid movie ID" },
        { status: 400 }
      );
    }

    // Parse request JSON and check for userId and rating
    const { userId, rating } = await req.json();
    console.log("User ID:", userId);
    console.log("Rating:", rating);

    if (!userId || rating === undefined) {
      return NextResponse.json(
        { error: "User ID and rating are required" },
        { status: 400 }
      );
    }

    // Check if the user exists
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userExists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if there’s an existing rating
    const existingRating = await db.query.userRatings.findFirst({
      where: and(
        eq(userRatings.userId, userId),
        eq(userRatings.movieId, movieId)
      ),
    });

    if (existingRating) {
      // Update existing rating if it exists
      await db
        .update(userRatings)
        .set({ rating })
        .where(eq(userRatings.id, existingRating.id));
      console.log("Updated existing rating for movieId:", movieId);
    } else {
      // Insert new rating if none exists
      await db.insert(userRatings).values({
        userId,
        movieId,
        rating,
      });
      console.log("Inserted new rating for movieId:", movieId);
    }

    return NextResponse.json({ message: "Rating saved successfully", rating });
  } catch (error) {
    // Cast error as an Error type
    const errorMessage = (error as Error).message || "Unknown error";
    console.error("Error saving rating:", errorMessage);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}
