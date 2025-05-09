import { NextResponse } from 'next/server';
import { useUser } from "@/app/auth/nextjs/useUser";
import { db } from "@/app/db/drizzle";
import * as schema from "@/app/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await useUser();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { filmIds } = await req.json();

    if (!filmIds || !Array.isArray(filmIds) || filmIds.length === 0) {
      return new NextResponse(JSON.stringify({ error: "Invalid filmIds" }), { status: 400 });
    }

    // Fetch all watchlist items for the user and the given filmIds
    const watchlistItems = await db
      .select({ filmId: schema.watchLists.filmId, watchListId: schema.watchLists.userId })
      .from(schema.watchLists)
      .where(and(eq(schema.watchLists.userId, userId), inArray(schema.watchLists.filmId, filmIds)));

    // Create a map of filmId to watchlistId for easy lookup
    const watchlistMap = new Map<number, string>();
    watchlistItems.forEach(item => {
      watchlistMap.set(item.filmId, item.watchListId);
    });

    // Create the result array, marking each filmId as inWatchlist or not
    const result = filmIds.map(filmId => ({
      filmId,
      inWatchlist: watchlistMap.has(filmId),
      watchListId: watchlistMap.get(filmId) || null,
    }));

    return new NextResponse(JSON.stringify(result), { status: 200 });

  } catch (error) {
    console.error("Error fetching bulk watchlist status:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
