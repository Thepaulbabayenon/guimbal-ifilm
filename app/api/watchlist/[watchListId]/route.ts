import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, CookiesHandler } from "@/app/auth/core/session"; 
import { db } from "@/app/db/drizzle";
import { watchLists } from "@/app/db/schema";
import { and, eq } from "drizzle-orm";
import { COOKIE_SESSION_KEY } from "@/app/auth/core/session";

export async function DELETE(req: NextRequest, { params }: { params: { watchListId?: string } }) {
  console.log("🟢 Received params:", params);

  if (!params?.watchListId) {
    console.error("🔴 Missing watchListId");
    return NextResponse.json({ error: "Missing watchListId" }, { status: 400 });
  }

  // ✅ Use CookiesHandler to extract session cookies
  const cookiesHandler = new CookiesHandler(req);
  const user = await getUserFromSession({
    [COOKIE_SESSION_KEY]: cookiesHandler.get(COOKIE_SESSION_KEY)?.value || "",
  });

  if (!user) {
    console.error("🔴 Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("🟢 Authenticated user:", user.id);

  // Extract filmId from request
  const filmId = parseInt(params.watchListId, 10);
  if (isNaN(filmId)) {
    console.error("🔴 Invalid filmId:", params.watchListId);
    return NextResponse.json({ error: "Invalid filmId" }, { status: 400 });
  }

  try {
    console.log(`🟢 User ${user.id} is trying to delete watchlist item with filmId ${filmId}`);

  
    const watchlistItem = await db
      .select()
      .from(watchLists)
      .where(and(eq(watchLists.userId, user.id), eq(watchLists.filmId, filmId)))
      .limit(1);

    console.log("🟢 Found watchlist item:", watchlistItem);

    if (!watchlistItem.length) {
      console.error("🔴 Watchlist item not found");
      return NextResponse.json({ error: "Watchlist item not found" }, { status: 404 });
    }

    await db.delete(watchLists).where(and(eq(watchLists.userId, user.id), eq(watchLists.filmId, filmId)));

    console.log("🟢 Successfully deleted watchlist item");
    return NextResponse.json({ message: "Removed from watchlist" }, { status: 200 });
  } catch (error) {
    console.error("🔴 Internal Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
