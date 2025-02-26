import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';  // Make sure to import the correct type
import { db } from '@/app/db/drizzle'; // Assuming centralized database connection
import { watchLists } from '@/app/db/schema'; // Import your watchlist schema
import { eq, and } from 'drizzle-orm'; // Import Drizzle ORM helper functions


// Function to get the user's watchlist
const getWatchlistForUser = async (userId: string) => {
  try {
    // Query the database for the user's watchlist
    const watchlist = await db.select()
      .from(watchLists)
      .where(eq(watchLists.userId, userId));

    return watchlist;
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    throw new Error("Failed to fetch watchlist");
  }
};

// GET endpoint for checking if a film is in the user's watchlist
export async function GET(request: NextRequest) {
  console.log("Received GET request for watchlist");

  const userId = request.nextUrl.searchParams.get('userId');
  const filmIds = request.nextUrl.searchParams.getAll('filmIds[]'); // Get multiple filmIds

  console.log("User ID:", userId);
  console.log("Film IDs:", filmIds);

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // Validate and parse film IDs
    const validFilmIds = filmIds
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id)); // Remove invalid IDs

    if (validFilmIds.length === 0) {
      return NextResponse.json({ error: "Invalid or missing film IDs" }, { status: 400 });
    }

    // Get the user's watchlist
    const watchlist = await getWatchlistForUser(userId);

    // Check which films are in the watchlist
    const results = validFilmIds.map((filmId) => ({
      filmId,
      isInWatchlist: watchlist.some((item: { filmId: number }) => item.filmId === filmId),
    }));

    return NextResponse.json({ watchlist: results });
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return NextResponse.json({ error: "Failed to check watchlist" }, { status: 500 });
  }
}



// Database function to add a film to the watchlist
const addFilmToWatchlist = async (userId: string, filmId: number) => {
  try {
    // Check if the film is already in the user's watchlist
    const existingEntry = await db.select()
      .from(watchLists)
      .where(and(eq(watchLists.userId, userId), eq(watchLists.filmId, filmId)))
      .limit(1);

    if (existingEntry.length > 0) {
      return { success: false, message: "Film is already in the watchlist" };
    }

    // Insert a new film into the watchlist (id will be auto-generated)
    const insertedWatchlistEntry = await db.insert(watchLists).values({
      userId,
      filmId,
      isFavorite: false,  // Default value for isFavorite
    }).returning();

    return insertedWatchlistEntry.length > 0
      ? { success: true }
      : { success: false, message: "Failed to add to watchlist" };
  } catch (error: unknown) {
    // Cast 'error' to 'Error' to access the 'message' property
    if (error instanceof Error) {
      console.error('Error adding film to watchlist:', error.message);
      return { success: false, message: error.message };
    } else {
      // Handle cases where the error is not an instance of 'Error'
      console.error('Unknown error:', error);
      return { success: false, message: "An unknown error occurred" };
    }
  }
};




// POST endpoint for adding a film to the watchlist
export async function POST(request: NextRequest) {
  try {
    const { filmId, userId } = await request.json();  // Removed `pathname`
    
    // Log incoming data for debugging
    console.log("Incoming Data:", { filmId, userId });

    if (!filmId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: filmId or userId" },
        { status: 400 }
      );
    }

    // Proceed with adding the movie to the watchlist
    const result = await addFilmToWatchlist(userId, filmId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/watchlist:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}


// Function to remove a film from the watchlist
const removeFromWatchlist = async (watchListId: number): Promise<void> => {
  if (!watchListId) {
    console.error("Error: Missing watchListId");
    return;
  }

  try {
    const response = await fetch(`/api/watchlist?watchListId=${watchListId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || "Failed to remove from watchlist");
    }

    console.log(`Successfully removed watchlist entry with ID: ${watchListId}`);
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    alert("Unable to remove film from watchlist. Please try again later.");
  }
};

// DELETE endpoint for removing a film from the watchlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const watchListIdParam = searchParams.get("watchListId");

    console.log("Received watchListId:", watchListIdParam); // Debugging log

    if (!watchListIdParam) {
      console.error("Error: watchListId parameter is missing in the request URL");
      return NextResponse.json({ error: "Missing watchListId" }, { status: 400 });
    }

    const watchListId = Number(watchListIdParam);

    if (isNaN(watchListId)) {
      console.error("Error: watchListId is not a valid number:", watchListIdParam);
      return NextResponse.json({ error: "Invalid watchListId" }, { status: 400 });
    }

    console.log(`Calling removeFromWatchlist with ID: ${watchListId}`);

    // Call the function instead of handling DB logic directly
    await removeFromWatchlist(watchListId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
