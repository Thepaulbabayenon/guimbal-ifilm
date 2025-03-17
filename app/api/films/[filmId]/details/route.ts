import { NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { eq, and } from 'drizzle-orm';
import { film, watchLists, userRatings } from '@/app/db/schema';
import { avg } from 'drizzle-orm';

// Define types for the request parameters
type RequestParams = {
  params: {
    filmId: string;  // Changed from 'id' to match the route parameter
  };
};

export async function GET(request: Request, { params }: RequestParams) {
  const filmId = Number(params.filmId);
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
  
    const filmDetails = await db.query.film.findFirst({
      where: eq(film.id, filmId)
    });

    if (!filmDetails) {
      return NextResponse.json({ error: 'Film not found' }, { status: 404 });
    }

    const response = {
      ...filmDetails,
      inWatchlist: false,
      watchlistId: null as number | null,
      userRating: null as number | null,
      averageRating: null as number | null
    };


    if (userId) {
     
      const watchlistItem = await db.query.watchLists.findFirst({
        where: and(
          eq(watchLists.userId, userId),
          eq(watchLists.filmId, filmId)
        )
      });
      
      const userRating = await db.query.userRatings.findFirst({
        where: and(
          eq(userRatings.userId, userId),
          eq(userRatings.filmId, filmId)
        )
      });
      
      const averageRatingResult = await db
        .select({ avgRating: avg(userRatings.rating) })
        .from(userRatings)
        .where(eq(userRatings.filmId, filmId));

      response.inWatchlist = !!watchlistItem;
      
    
      response.watchlistId = watchlistItem ? Number(watchlistItem.filmId) : null;
      
    
      response.userRating = userRating ? Number(userRating.rating) : null;
      
      
      response.averageRating = averageRatingResult[0]?.avgRating ? Number(averageRatingResult[0].avgRating) : null;
    } else {
   
      const averageRatingResult = await db
        .select({ avgRating: avg(userRatings.rating) })
        .from(userRatings)
        .where(eq(userRatings.filmId, filmId));
      
      response.averageRating = averageRatingResult[0]?.avgRating ? Number(averageRatingResult[0].avgRating) : null;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching film details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}