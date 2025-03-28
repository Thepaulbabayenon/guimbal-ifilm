import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { db } from '@/app/db/drizzle';
import { watchLists } from '@/app/db/schema';
import { eq, and } from 'drizzle-orm';

const getWatchlistForUser = async (userId: string) => {
  try {
    const watchlist = await db.select()
      .from(watchLists)
      .where(eq(watchLists.userId, userId));
    
    return watchlist;
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    throw new Error("Failed to fetch watchlist");
  }
};

export async function GET(request: NextRequest) {
  console.log("Received GET request for watchlist");

  const userId = request.nextUrl.searchParams.get('userId');
  const filmIds = request.nextUrl.searchParams.getAll('filmIds[]');

  console.log("User ID:", userId);
  console.log("Film IDs:", filmIds);

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    if (filmIds.length === 0) {
      const fullWatchlist = await getWatchlistForUser(userId);
      
      // Make sure we return a consistent format
      return NextResponse.json({ 
        watchlist: fullWatchlist.map(item => ({
          userId: item.userId,
          filmId: item.filmId,
          isFavorite: item.isFavorite,
          addedAt: item.addedAt || item.addedAt || new Date().toISOString()
        }))
      });
    }

    // Rest of the code...
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return NextResponse.json({ error: "Failed to check watchlist" }, { status: 500 });
  }
}

const addFilmToWatchlist = async (userId: string, filmId: number) => {
  try {
    const existingEntry = await db.select()
      .from(watchLists)
      .where(and(eq(watchLists.userId, userId), eq(watchLists.filmId, filmId)))
      .limit(1);

    if (existingEntry.length > 0) {
      return { success: false, message: "Film is already in the watchlist" };
    }

    const insertedWatchlistEntry = await db.insert(watchLists).values({
      userId,
      filmId,
      isFavorite: false,
    }).returning();

    return insertedWatchlistEntry.length > 0
      ? { success: true }
      : { success: false, message: "Failed to add to watchlist" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error adding film to watchlist:', error.message);
      return { success: false, message: error.message };
    } else {
      console.error('Unknown error:', error);
      return { success: false, message: "An unknown error occurred" };
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const { filmId, userId } = await request.json();
    
    console.log("Incoming Data:", { filmId, userId });

    if (!filmId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: filmId or userId" },
        { status: 400 }
      );
    }

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

const removeFromWatchlist = async (userId: string, filmId: number) => {
  try {
    await db.delete(watchLists)
      .where(
        and(
          eq(watchLists.userId, userId),
          eq(watchLists.filmId, filmId)
        )
      );
    return { success: true };
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
};

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const filmId = searchParams.get("filmId");

    if (!userId || !filmId) {
      return NextResponse.json({ error: "Missing userId or filmId" }, { status: 400 });
    }

    const numericFilmId = parseInt(filmId);
    if (isNaN(numericFilmId)) {
      return NextResponse.json({ error: "Invalid filmId" }, { status: 400 });
    }

    const result = await removeFromWatchlist(userId, numericFilmId);
    
    if (result.success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// New API endpoint for toggling favorite status
export async function PATCH(request: NextRequest) {
  try {
    const { userId, filmId } = await request.json();
    
    if (!userId || !filmId) {
      return NextResponse.json(
        { error: "Missing required fields: userId or filmId" },
        { status: 400 }
      );
    }
    
    // First, check if the film is in the watchlist
    const existingEntry = await db.select()
      .from(watchLists)
      .where(and(eq(watchLists.userId, userId), eq(watchLists.filmId, filmId)))
      .limit(1);
      
    if (existingEntry.length === 0) {
      return NextResponse.json(
        { error: "Film is not in the watchlist" },
        { status: 404 }
      );
    }
    
    // Toggle the favorite status
    const currentFavoriteStatus = existingEntry[0].isFavorite;
    const newFavoriteStatus = !currentFavoriteStatus;
    
    // Update the watchlist entry
    const updatedEntry = await db.update(watchLists)
      .set({ isFavorite: newFavoriteStatus })
      .where(and(eq(watchLists.userId, userId), eq(watchLists.filmId, filmId)))
      .returning();
      
    return NextResponse.json({
      success: true,
      isFavorite: newFavoriteStatus,
      watchlistEntry: updatedEntry[0]
    });
  } catch (error) {
    console.error("Error toggling favorite status:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite status" },
      { status: 500 }
    );
  }
}