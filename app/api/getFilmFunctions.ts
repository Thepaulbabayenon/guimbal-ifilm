import { db } from '@/app/db/drizzle'; 
import { userRatings, film, watchLists } from '@/app/db/schema'; 
import { eq } from 'drizzle-orm/expressions';  // Correct import for eq

export async function getUserRatings(userId: string) {
  const ratings = await db
    .select({
      filmId: userRatings.filmId,
      rating: userRatings.rating,
    })
    .from(userRatings)
    .where(eq(userRatings.userId, userId));  // Corrected query syntax

  return ratings.reduce((acc, { filmId, rating }) => {
    acc[filmId] = rating;
    return acc;
  }, {} as Record<string, number>);
}

export async function getWatchlistStatus(userId: string) {
  const watchlistStatus = await db
    .select({
      filmId: watchLists.filmId,
      isFavorite: watchLists.isFavorite,
    })
    .from(watchLists)
    .where(eq(watchLists.userId, userId));  // Corrected query syntax

  return watchlistStatus.reduce((acc, { filmId, isFavorite }) => {
    acc[filmId] = isFavorite ?? false;  // Handle null by defaulting to false
    return acc;
  }, {} as Record<string, boolean>);
}

export async function getAverageRatings() {
  const ratings = await db
    .select({
      filmId: userRatings.filmId,
      rating: userRatings.rating,
    })
    .from(userRatings);

  const averageRatings = ratings.reduce((acc, { filmId, rating }) => {
    if (!acc[filmId]) {
      acc[filmId] = { totalRating: 0, count: 0 };
    }
    acc[filmId].totalRating += rating;
    acc[filmId].count += 1;
    return acc;
  }, {} as Record<string, { totalRating: number; count: number }>);

  const filmAvgRatings = Object.fromEntries(
    Object.entries(averageRatings).map(([filmId, { totalRating, count }]) => {
      return [filmId, totalRating / count];
    })
  );

  return filmAvgRatings;
}
