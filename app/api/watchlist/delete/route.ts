import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle"; // Drizzle import
import { watchLists } from "@/db/schema"; // Import your schema
import { eq, and } from "drizzle-orm"; // Import eq and and for filtering

// POST handler for adding an entry to the watchlist
export async function POST(req: NextRequest) {
  try {
    const { filmId, userId } = await req.json(); // Parse request body

    // Validate input data
    if (!filmId || !userId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if the film is already in the user's watchlist
    const existingEntry = await db
      .select()
      .from(watchLists)
      .where(and(eq(watchLists.userId, userId), eq(watchLists.filmId, filmId))) // Use and to combine conditions
      .limit(1);

    if (existingEntry.length > 0) {
      return NextResponse.json(
        { message: "Film is already in the watchlist" },
        { status: 400 }
      );
    }

    // Add the new watchlist entry
    const newEntry = await db
      .insert(watchLists)
      .values({
        id: crypto.randomUUID(),
        userId,
        filmId,
        isFavorite: false, // Default to false
      })
      .returning();

    return NextResponse.json(
      { message: "Film added to watchlist successfully", data: newEntry },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding film to watchlist:", error);
    return NextResponse.json(
      { message: "Failed to add film to watchlist" },
      { status: 500 }
    );
  }
}

// DELETE handler for removing an entry from the watchlist
export async function DELETE(req: NextRequest) {
  try {
    const { watchListId, userId } = await req.json(); // Parse `userId` and `watchListId` from the request body

    // Validate if the watchListId is a valid UUID
    if (!watchListId || !isValidUUID(watchListId)) {
      return NextResponse.json(
        { message: "Invalid or missing watchListId" },
        { status: 400 }
      );
    }

    // Validate if the userId is provided
    if (!userId) {
      return NextResponse.json(
        { message: "Missing userId" },
        { status: 400 }
      );
    }

    // Delete the entry from the watchLists table with the condition (watchListId and userId)
    const deletedWatchlist = await db
      .delete(watchLists)
      .where(and(eq(watchLists.id, watchListId), eq(watchLists.userId, userId))) // Use and to combine conditions
      .returning();

    // Check if any rows were deleted
    if (deletedWatchlist.length === 0) {
      return NextResponse.json(
        { message: "Watchlist entry not found" },
        { status: 404 }
      );
    }

    // Respond with the success message
    return NextResponse.json(
      { message: "Watchlist entry deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting watchlist entry:", error);
    return NextResponse.json(
      { message: "Failed to delete from watchlist" },
      { status: 500 }
    );
  }
}

// Helper function to validate UUID format
function isValidUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}
