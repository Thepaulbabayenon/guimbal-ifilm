import { db } from "@/app/db/drizzle";
import { users, watchLists, film, userInteractions } from "@/app/db/schema";
import { desc, eq, and, like } from "drizzle-orm";

export async function getUserData(userEmail: string) {
  console.log("Fetching data for user email:", userEmail);


  const userIdData = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, userEmail))
    .limit(1);

  if (userIdData.length === 0) {
    throw new Error("User not found");
  }

  const userId = userIdData[0].id;

  const userData = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const watchlistData = await db
    .select({
      title: film.title,
      age: film.ageRating,
      duration: film.duration,
      imageString: film.imageUrl,
      overview: film.overview,
      release: film.releaseYear,
      id: film.id,
      trailer: film.trailerUrl,
      watchListId: watchLists.userId,
      category: film.category
    })
    .from(film)
    .leftJoin(watchLists, eq(film.id, watchLists.filmId))
    .where(eq(watchLists.userId, userId));

  const top10Data = await db
    .select({
      title: film.title,
      age: film.ageRating,
      duration: film.duration,
      imageString: film.imageUrl,
      overview: film.overview,
      release: film.releaseYear,
      id: film.id,
      category: film.category
    })
    .from(film)
    .orderBy(desc(film.releaseYear))
    .limit(10);

  const favoritesData = await db
    .select({
      title: film.title,
      age: film.ageRating,
      duration: film.duration,
      imageString: film.imageUrl,
      overview: film.overview,
      release: film.releaseYear,
      id: film.id,
      category: film.category
    })
    .from(film)
    .leftJoin(userInteractions, eq(film.id, userInteractions.filmId))
    .where(
      and(
        eq(userInteractions.userId, userId),
        eq(userInteractions.ratings, 5)
      )
    );

  return {
    user: userData[0] || null,
    watchlist: watchlistData,
    top10: top10Data,
    favorites: favoritesData,
  };
}

export async function getUsersByName(userName: string) {
  console.log("Searching for users with name:", userName);


  const usersData = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(like(users.name, `%${userName}%`));

  return usersData;
}
