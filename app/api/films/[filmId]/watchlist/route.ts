import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { watchLists } from "@/app/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { filmId: string } }
) {
  // Wait for params to be ready before accessing filmId
  const filmIdParam = await params.filmId;
  const filmId = parseInt(filmIdParam, 10);
  const userId = request.nextUrl.searchParams.get("userId");
  
  console.log("Checking watchlist for filmId:", filmId, "userId:", userId);
  
  if (!userId || isNaN(filmId)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  try {
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