import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { watchLists } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { isValidUUID } from "@/app/utils/uuid";

// Helper function to remove movie from the watchlist
const removeMovieFromWatchlist = async (userId: string, watchListId: string) => {
  try {
    const deletedWatchlistEntry = await db
      .delete(watchLists)
      .where(and(eq(watchLists.id, watchListId), eq(watchLists.userId, userId)))
      .returning();

    return deletedWatchlistEntry.length > 0
      ? { success: true }
      : { success: false, message: "Watchlist entry not found" };
  } catch (error) {
    console.error("Error deleting watchlist entry:", error);
    return { success: false, message: (error as Error).message };
  }
};

// DELETE request for removing a movie from the watchlist
export async function DELETE(request: Request, { params }: { params: { watchListId: string } }) {
  const { watchListId } = params;

  // Validate watchListId - it should be a valid UUID
  if (!watchListId || !isValidUUID(watchListId)) {
    return NextResponse.json({ error: "Invalid or missing watchListId" }, { status: 400 });
  }

  // Parse the userId from the request body
  const { userId } = await request.json();

  // Check for missing `userId`
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // Call function to remove the movie
  const result = await removeMovieFromWatchlist(userId, watchListId);
  if (result.success) {
    return NextResponse.json({ message: "Movie removed from watchlist successfully" }, { status: 200 });
  } else {
    return NextResponse.json({ error: result.message || "Failed to remove from watchlist" }, { status: 400 });
  }
}