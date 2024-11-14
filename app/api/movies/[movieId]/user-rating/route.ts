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
    // Parse and validate movieId
    const movieId = parseInt(params.movieId);
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: "Invalid movie ID" },
        { status: 400 }
      );
    }

    // Parse JSON body to get userId and rating
    const { userId, rating } = await req.json();
    console.log("User ID:", userId);
    console.log("Rating:", rating);

    // Ensure userId and rating are present
    if (!userId || rating === undefined) {
      return NextResponse.json(
        { error: "User ID and rating are required" },
        { status: 400 }
      );
    }

    // Validate rating is within a valid range (1-5)
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if user exists in the users table
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userExists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check for an existing rating for this user and movie
    const existingRating = await db.query.userRatings.findFirst({
      where: and(
        eq(userRatings.userId, userId),
        eq(userRatings.movieId, movieId)
      ),
    });

    if (existingRating) {
      // Update rating if it already exists
      await db
        .update(userRatings)
        .set({ rating })
        .where(eq(userRatings.id, existingRating.id));
      console.log("Updated existing rating for movieId:", movieId);
    } else {
      // Insert new rating if no existing rating is found
      await db.insert(userRatings).values({
        userId,
        movieId,
        rating,
      });
      console.log("Inserted new rating for movieId:", movieId);
    }

    // Optional: Fetch the updated rating data or average ratings for the movie
    const updatedRating = await db.query.userRatings.findFirst({
      where: and(
        eq(userRatings.userId, userId),
        eq(userRatings.movieId, movieId)
      ),
    });

    // Return success response with updated rating information
    return NextResponse.json({
      message: "Rating saved successfully",
      rating: updatedRating?.rating || rating,  // Return the saved rating
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
