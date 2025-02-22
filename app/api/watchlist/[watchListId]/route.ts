import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/app/db/drizzle";
import { watchLists } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: NextRequest, { params }: { params: { watchListId?: string } }) {
  console.log("🟢 Received params:", params);

  if (!params?.watchListId) {
    console.error("🔴 Missing watchlistId");
    return NextResponse.json({ error: "Missing watchlistId" }, { status: 400 });
  }

  const { userId } = getAuth(req);
  console.log("🟢 Authenticated user:", userId);

  if (!userId) {
    console.error("🔴 Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Convert watchlistId to a number
  const watchListIdNumber = parseInt(params.watchListId, 10);
  if (isNaN(watchListIdNumber)) {
    console.error("🔴 Invalid watchlistId:", params.watchListId);
    return NextResponse.json({ error: "Invalid watchlistId" }, { status: 400 });
  }

  try {
    console.log(`🟢 User ${userId} is trying to delete watchlist item ${watchListIdNumber}`);

    // Fetch the watchlist entry
    const watchlistItem = await db
      .select()
      .from(watchLists)
      .where(eq(watchLists.id, watchListIdNumber))
      .limit(1);

    console.log("🟢 Found watchlist item:", watchlistItem);

    if (!watchlistItem.length) {
      console.error("🔴 Watchlist item not found");
      return NextResponse.json({ error: "Watchlist item not found" }, { status: 404 });
    }

    if (watchlistItem[0].userId !== userId) {
      console.error("🔴 User does not own this watchlist item");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the watchlist entry
    await db.delete(watchLists).where(eq(watchLists.id, watchListIdNumber));

    console.log("🟢 Successfully deleted watchlist item");
    return NextResponse.json({ message: "Removed from watchlist" }, { status: 200 });
  } catch (error) {
    console.error("🔴 Internal Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
