
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle"; 
import { eq, and } from "drizzle-orm";
import { watchLists } from "@/app/db/schema"; 

export async function GET(
  request: NextRequest,
  { params }: { params: { filmId: string } }
) {
  try {
  
    const filmId = Number(params.filmId);
    
 
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (isNaN(filmId)) {
      return NextResponse.json(
        { error: "Invalid film ID" },
        { status: 400 }
      );
    }

 
    const watchlistEntry = await db.select()
      .from(watchLists)
      .where(
        and(
          eq(watchLists.userId, userId),
          eq(watchLists.filmId, filmId)
        )
      )
      .limit(1);


    return NextResponse.json({
      inWatchlist: watchlistEntry.length > 0,
      watchListId: watchlistEntry.length > 0 ? `${userId}-${filmId}` : null
    });
  } catch (error) {
    console.error("Error getting watchlist status:", error);
    return NextResponse.json(
      { error: "Failed to get watchlist status" },
      { status: 500 }
    );
  }
}