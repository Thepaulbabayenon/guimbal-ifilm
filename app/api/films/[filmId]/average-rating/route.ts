import { db } from "@/db/drizzle";
import { userRatings } from "@/db/schema";
import { eq, avg } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { filmId: string } }
) {
  try {
    const result = await db
      .select({
        averageRating: avg(userRatings.rating),
      })
      .from(userRatings)
      .where(eq(userRatings.filmId, parseInt(params.filmId)));

    const averageRating = result[0]?.averageRating || 0;

    return NextResponse.json({ averageRating });
  } catch (error) {
    console.error("Error calculating average rating:", error);
    return NextResponse.json(
      { error: "Failed to calculate average rating" },
      { status: 500 }
    );
  }
}
