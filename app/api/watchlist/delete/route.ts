import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';  // Drizzle import
import { watchLists } from '@/db/schema'; // Import your schema
import { eq } from 'drizzle-orm';  // Import eq function for filtering

// Define DELETE handler
export async function DELETE(req: NextRequest) {
  try {
    const { watchListId } = await req.json(); // Assuming watchListId is passed in the body

    // Validate if the watchListId is a valid UUID
    if (!watchListId || !isValidUUID(watchListId)) {
      return NextResponse.json({ message: 'Invalid or missing watchListId' }, { status: 400 });
    }

    // Delete the entry from the watchLists table with the condition (watchListId)
    const deletedWatchlist = await db
      .delete(watchLists)
      .where(eq(watchLists.id, watchListId))  // Use eq for comparison
      .returning();  // Return the deleted row(s)

    // Check if any rows were deleted
    if (deletedWatchlist.length === 0) {
      return NextResponse.json({ message: 'Watchlist entry not found' }, { status: 404 });
    }

    // Respond with the success message
    return NextResponse.json({ message: 'Watchlist entry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting watchlist entry:", error);
    return NextResponse.json({ message: 'Failed to delete from watchlist' }, { status: 500 });
  }
}

// Helper function to validate UUID format
function isValidUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}
