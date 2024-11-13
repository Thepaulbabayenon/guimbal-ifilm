import { db } from "@/db/drizzle";
import { userRatings, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { movieId: string } }
) {
  console.log("Received POST request for movieId:", params.movieId);
  console.log("Request method:", req.method); // Log method

  try {
    const { userId, rating } = await req.json();

    console.log("User ID:", userId);
    console.log("Rating:", rating);

    if (!userId || rating === undefined) { // Ensure rating is defined
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
        { status: 408 }
      );
    }

    // Handle the rating logic (either create or update the rating)
    const existingRating = await db.query.userRatings.findFirst({
      where: and(
        eq(userRatings.userId, userId),
        eq(userRatings.movieId, parseInt(params.movieId))
      ),
    });

    if (existingRating) {
      // Update the existing rating
      await db
        .update(userRatings)
        .set({ rating })
        .where(eq(userRatings.id, existingRating.id));
    } else {
      // Insert new rating
      await db.insert(userRatings).values({
        userId,
        movieId: parseInt(params.movieId),
        rating,
      });
    }

    // Return success response with the rating
    return NextResponse.json({ message: "Rating saved successfully", rating });
  } catch (error) {
    console.error("Error saving rating:", error);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}
