import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { watchLists } from "@/app/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { filmId: string } }
) {
  try {
    // Await params if it's a promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const filmId = parseInt(resolvedParams.filmId, 10);
    const userId = request.nextUrl.searchParams.get("userId");
    
    console.log("Checking watchlist for filmId:", filmId, "userId:", userId);
    
    if (!userId || isNaN(filmId)) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const watchlistItems = await db
      .select()
      .from(watchLists)
      .where(and(
        eq(watchLists.userId, userId),
        eq(watchLists.filmId, filmId)
      ))
      .limit(1);
    
    console.log("Watchlist check result:", watchlistItems);
    
    if (watchlistItems.length > 0) {
      return NextResponse.json({
        inWatchlist: true,
        watchListId: { userId: watchlistItems[0].userId, filmId: watchlistItems[0].filmId }
      });
    } else {
      return NextResponse.json({
        inWatchlist: false,
        watchListId: null
      });
    }
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}