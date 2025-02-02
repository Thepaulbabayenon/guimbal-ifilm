import { NextRequest } from 'next/server';
import { db } from '@/app/db/drizzle';
import { watchLists } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId"); // Extracting userId from query parameters
  const watchListId = req.nextUrl.pathname.split('/').pop(); // Extracting watchListId from the URL path

  console.log("Request URL:", req.nextUrl.href); // Logs the full URL for debugging
  console.log("Search Params:", searchParams.toString()); // Logs the query parameters for debugging
  console.log("Deleting watchlist entry with userId:", userId, "watchListId:", watchListId); // Debugging log

  if (!userId || !watchListId) {
    return NextResponse.json({ message: 'Missing userId or watchListId' }, { status: 400 });
  }

  try {
    // Ensure the watchListId is a number (it should be, since it's an integer in the DB)
    const parsedWatchListId = parseInt(watchListId);

    if (isNaN(parsedWatchListId)) {
      return NextResponse.json({ message: 'Invalid watchListId' }, { status: 400 });
    }

    // Combine both conditions into one `where` clause using `and`
    const deletedWatchlist = await db
      .delete(watchLists)
      .where(
        eq(watchLists.id, parsedWatchListId) && eq(watchLists.userId, userId) // Delete if both conditions match
      )  
      .returning();

    if (deletedWatchlist.length === 0) {
      return NextResponse.json({ message: 'Watchlist entry not found or not associated with user' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Watchlist entry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting watchlist entry:', error);
    return NextResponse.json({ message: 'Failed to delete from watchlist' }, { status: 500 });
  }
}
