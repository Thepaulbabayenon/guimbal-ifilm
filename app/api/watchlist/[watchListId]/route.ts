import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, CookiesHandler } from "@/app/auth/core/session"; 
import { db } from "@/app/db/drizzle";
import { watchLists } from "@/app/db/schema";
import { and, eq } from "drizzle-orm";
import { COOKIE_SESSION_KEY } from "@/app/auth/core/session";

export async function DELETE(
  req: NextRequest, 
  { params }: { params: { watchListId: string } }
) {
  console.log("🟢 Deleting film from watchlist, params:", params);

  // Extract filmId from URL path - Using watchListId as the filmId
  const filmId = parseInt(params.watchListId, 10);
  if (isNaN(filmId)) {
    console.error("🔴 Invalid filmId:", params.watchListId);
    return NextResponse.json({ error: "Invalid filmId" }, { status: 400 });
  }
  
  // Get authenticated user
  const cookiesHandler = new CookiesHandler(req);
  const user = await getUserFromSession({
    [COOKIE_SESSION_KEY]: cookiesHandler.get(COOKIE_SESSION_KEY)?.value || "",
  });

  if (!user) {
    console.error("🔴 Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(`🟢 User ${user.id} is removing film ${filmId} from watchlist`);
  
  try {
    // Check if item exists first
    const watchlistItem = await db
      .select()
      .from(watchLists)
      .where(and(eq(watchLists.userId, user.id), eq(watchLists.filmId, filmId)))
      .limit(1);

    if (!watchlistItem.length) {
      console.error("🔴 Watchlist item not found");
      return NextResponse.json({ error: "Watchlist item not found" }, { status: 404 });
    }

    // Delete the watchlist item
    await db.delete(watchLists)
      .where(and(
        eq(watchLists.userId, user.id),
        eq(watchLists.filmId, filmId)
      ));
      
    console.log("🟢 Successfully deleted watchlist item");
    return NextResponse.json({ success: true, message: "Removed from watchlist" });
  } catch (error) {
    console.error("🔴 Error deleting watchlist item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}