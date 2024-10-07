import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/db/drizzle'; // Assumes a centralized db connection setup for Drizzle ORM
import { watchLists } from '@/db/schema'; // Import your watchlist schema
import { eq, and } from 'drizzle-orm'; // Import the correct operators

// Database function to remove a movie from the watchlist
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
    console.error('Error deleting watchlist entry:', error);
    return { success: false, message: (error as Error).message };
  }
};

// DELETE endpoint for removing a movie from the watchlist
export async function DELETE(request: NextRequest, { params }: { params: { watchListId: string } }) {
  const { watchListId } = params;

  try {
    if (!watchListId) {
      return NextResponse.json({ error: "Missing watchListId" }, { status: 400 });
    }

    // Assuming userId is sent in the request body (adjust if needed)
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Remove the movie from the watchlist
    const result = await removeMovieFromWatchlist(userId, watchListId);

    if (result.success) {
      return NextResponse.json({ message: "Movie removed from watchlist successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ error: result.message || "Failed to remove from watchlist" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in DELETE /api/watchlist/[watchListId]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
