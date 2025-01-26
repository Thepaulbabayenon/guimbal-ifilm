import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';  // Make sure to import the correct type
import { db } from '@/db/drizzle'; // Assuming centralized database connection
import { watchLists } from '@/db/schema'; // Import your watchlist schema
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
  // Use .get() to retrieve query parameters
  const userId = request.nextUrl.searchParams.get('userId');
  const filmId = request.nextUrl.searchParams.get('filmId');

  if (!userId || !filmId) {
    return NextResponse.json({ error: "Missing userId or filmId" }, { status: 400 });
  }

  try {
    // Get the user's watchlist
    const watchlist = await getWatchlistForUser(userId);

    // Check if the filmId exists in the watchlist
    const isInWatchlist = watchlist.some((item: { filmId: number }) => item.filmId === Number(filmId));

    return NextResponse.json({ isInWatchlist });
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return NextResponse.json({ error: "Failed to check watchlist" }, { status: 500 });
  }
}

// Database function to add a film to the watchlist
// Database function to add a film to the watchlist
// Database function to add a film to the watchlist
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
    const { filmId, pathname, userId } = await request.json();
    
    // Log incoming data for debugging
    console.log("Incoming Data:", { filmId, pathname, userId });

    if (!filmId || !pathname || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: filmId, pathname, or userId" },
        { status: 400 }
      );
    }

    // Proceed with your business logic (e.g., adding the movie to the watchlist)
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
