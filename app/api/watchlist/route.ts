import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/db/drizzle'; // Assuming centralized database connection
import { watchLists } from '@/db/schema'; // Import your watchlist schema
import { eq, and } from 'drizzle-orm'; // Import Drizzle ORM helper functions

// Database function to add a film to the watchlist
const addFilmToWatchlist = async (userId: string, filmId: number) => {
  try {
    // Check if the film is already in the user's watchlist
    const existingEntry = await db.select()
      .from(watchLists)
      .where(and(eq(watchLists.userId, userId), eq(watchLists.filmId, filmId))) // Fixed: using 'and' for multiple conditions
      .limit(1);

    if (existingEntry.length > 0) {
      return { success: false, message: "Film is already in the watchlist" };
    }

    // Insert a new film into the watchlist (ensure 'id' is provided)
    const insertedWatchlistEntry = await db.insert(watchLists).values({
      id: crypto.randomUUID(), // Generate a unique ID for the new watchlist entry
      userId,
      filmId,
      isFavorite: false, // Default to false (adjust if needed)
    }).returning();

    return insertedWatchlistEntry.length > 0
      ? { success: true }
      : { success: false, message: "Failed to add to watchlist" };
  } catch (error) {
    console.error('Error adding film to watchlist:', (error as Error).message); // Cast error to 'Error' to access message
    return { success: false, message: (error as Error).message };
  }
};

// POST endpoint for adding a film to the watchlist
export async function POST(request: NextRequest) {
  try {
    const { filmId, pathname, userId } = await request.json();

    // Validate the incoming data
    if (!filmId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Add the film to the watchlist
    const result = await addFilmToWatchlist(userId, filmId);

    if (result.success) {
      return NextResponse.json({ message: "Film added to watchlist successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ error: result.message || "Failed to add to watchlist" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in POST /api/watchlist:", (error as Error).message); // Cast error to 'Error'
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
