import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle';  // Drizzle import
import { watchLists } from '@/db/schema'; // Import your schema
import { eq } from 'drizzle-orm';  // Import eq function for filtering

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    const { watchListId } = req.body; // Assuming watchListId is passed in the body

    // Validate if the watchListId is a valid UUID
    if (!watchListId || !isValidUUID(watchListId)) {
      return res.status(400).json({ message: 'Invalid or missing watchListId' });
    }

    try {
      // Delete the entry from the watchLists table with the condition (watchListId)
      const deletedWatchlist = await db
        .delete(watchLists)
        .where(eq(watchLists.id, watchListId))  // Use eq for comparison
        .returning();  // Return the deleted row(s)

      // Check if any rows were deleted
      if (deletedWatchlist.length === 0) {
        return res.status(404).json({ message: 'Watchlist entry not found' });
      }

      // Respond with the success message
      return res.status(200).json({ message: 'Watchlist entry deleted successfully' });
    } catch (error) {
      console.error("Error deleting watchlist entry:", error);
      return res.status(500).json({ message: 'Failed to delete from watchlist' });
    }
  }

  // Method Not Allowed for other HTTP methods
  return res.status(405).json({ message: 'Method Not Allowed' });
}

// Helper function to validate UUID format
function isValidUUID(uuid: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}
