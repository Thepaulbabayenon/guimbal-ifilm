import { db } from "@/db/drizzle";
import { film, userInteractions, watchLists } from "@/db/schema";
import { eq, and, desc, like, or, sql } from "drizzle-orm";

// Define the Film type (you can adjust fields to match your database schema)
interface Film {
  id: number;
  title: string;
  age: number;
  duration: number;
  imageString: string;
  overview: string;
  release: number;
  videoSource: string;
  category: string;
  youtubeString: string;
  rank: number;
  userId: string;
}

/**
 * Fetch all films from the database.
 */
export async function getAllFilms() {
  console.log("Fetching all films");

  const filmsData = await db
    .select({
      id: film.id,
      title: film.title,
      age: film.age,
      duration: film.duration,
      imageString: film.imageString,
      overview: film.overview,
      release: film.release,
      videoSource: film.videoSource,
      category: film.category,
      youtubeString: film.youtubeString,
      rank: film.rank,
    })
    .from(film)
    .orderBy(desc(film.release)); // Sort by release date in descending order

  return filmsData;
}

/**
 * Fetch a specific film by ID.
 * @param filmId - The ID of the film to fetch.
 */
export async function getFilmById(filmId: number) {
  console.log("Fetching film with ID:", filmId);

  const filmData = await db
    .select({
      id: film.id,
      title: film.title,
      age: film.age,
      duration: film.duration,
      imageString: film.imageString,
      overview: film.overview,
      release: film.release,
      videoSource: film.videoSource,
      category: film.category,
      youtubeString: film.youtubeString,
      rank: film.rank,
    })
    .from(film)
    .where(eq(film.id, filmId))
    .limit(1);

  if (filmData.length === 0) {
    throw new Error("Film not found");
  }

  return filmData[0];
}

/**
 * Fetch films based on a search term.
 * @param searchTerm - The term to search for in film titles or categories.
 */
export async function searchFilms(searchTerm: string) {
  console.log("Searching for films with term:", searchTerm);

  const filmsData = await db
    .select({
      id: film.id,
      title: film.title,
      age: film.age,
      duration: film.duration,
      imageString: film.imageString,
      overview: film.overview,
      release: film.release,
      videoSource: film.videoSource,
      category: film.category,
      youtubeString: film.youtubeString,
      rank: film.rank,
    })
    .from(film)
    .where(
      or(
        like(film.title, `%${searchTerm}%`),
        like(film.category, `%${searchTerm}%`)
      )
    )
    .orderBy(desc(film.release)); // Sort by release date in descending order

  return filmsData;
}

/**
 * Fetch top-rated films.
 * This function returns the top 10 films based on their rank.
 */
export async function getTopRatedFilms() {
  console.log("Fetching top-rated films");

  const topRatedFilmsData = await db
    .select({
      id: film.id,
      title: film.title,
      age: film.age,
      duration: film.duration,
      imageString: film.imageString,
      overview: film.overview,
      release: film.release,
      videoSource: film.videoSource,
      category: film.category,
      youtubeString: film.youtubeString,
      rank: film.rank,
    })
    .from(film)
    .orderBy(desc(film.rank)) // Sort by rank in descending order
    .limit(10);

  return topRatedFilmsData;
}

/**
 * Fetch horror films.
 * This function returns all films that belong to the horror category.
 */
export async function getHorrorFilms() {
  console.log("Fetching horror films");

  const horrorFilmsData = await db
    .select({
      id: film.id,
      title: film.title,
      age: film.age,
      duration: film.duration,
      imageString: film.imageString,
      overview: film.overview,
      release: film.release,
      videoSource: film.videoSource,
      category: film.category,
      youtubeString: film.youtubeString,
      rank: film.rank,
    })
    .from(film)
    .where(eq(film.category, 'Horror')) // Filter by category "Horror"
    .orderBy(desc(film.release)); // Sort by release date in descending order

  return horrorFilmsData;
}

/**
 * Fetch folklore films.
 * This function returns all films that belong to the folklore category.
 */
export async function getFolkloreFilms() {
  console.log("Fetching folklore films");

  const folkloreFilmsData = await db
    .select({
      id: film.id,
      title: film.title,
      age: film.age,
      duration: film.duration,
      imageString: film.imageString,
      overview: film.overview,
      release: film.release,
      videoSource: film.videoSource,
      category: film.category,
      youtubeString: film.youtubeString,
      rank: film.rank,
    })
    .from(film)
    .where(eq(film.category, 'Folklore')) // Filter by category "Folklore"
    .orderBy(desc(film.release)); // Sort by release date in descending order

  return folkloreFilmsData;
}

/**
 * Fetch comedy films.
 * This function returns all films that belong to the comedy category.
 */
export async function getComedyFilms() {
  console.log("Fetching comedy films");

  const comedyFilmsData = await db
    .select({
      id: film.id,
      title: film.title,
      age: film.age,
      duration: film.duration,
      imageString: film.imageString,
      overview: film.overview,
      release: film.release,
      videoSource: film.videoSource,
      category: film.category,
      youtubeString: film.youtubeString,
      rank: film.rank,
    })
    .from(film)
    .where(eq(film.category, 'Comedy')) // Filter by category "Comedy"
    .orderBy(desc(film.release)); // Sort by release date in descending order

  return comedyFilmsData;
}

export async function getRecommendedFilms(userId: string): Promise<Film[]> {
  try {
    const response = await fetch(`http://localhost:3000/api/recommendations?userId=${userId}`);
    const data = await response.json();

    return data.films.map((film: any) => ({
      id: film.id,
      title: film.title,
      age: film.age,
      duration: film.duration,
      imageString: film.imageString,
      overview: film.overview,
      release: film.release,
      videoSource: film.videoSource,
      category: film.category,
      youtubeString: film.youtubeString,
      rank: film.rank, // External rating
    }));
  } catch (error) {
    console.error("Error fetching recommended films:", error);
    return [];
  }
}

/**
 * Fetch drama films.
 * This function returns all films that belong to the drama category.
 */
export async function getDramaFilms() {
  console.log("Fetching drama films");

  const dramaFilmsData = await db
    .select({
      id: film.id,
      title: film.title,
      age: film.age,
      duration: film.duration,
      imageString: film.imageString,
      overview: film.overview,
      release: film.release,
      videoSource: film.videoSource,
      category: film.category,
      youtubeString: film.youtubeString,
      rank: film.rank,
    })
    .from(film)
    .where(eq(film.category, 'Drama')) // Filter by category "Drama"
    .orderBy(desc(film.release)); // Sort by release date in descending order

  return dramaFilmsData;
}

export async function fetchCategories() {
  // Define the expected type for the rows
  const categories = await db.execute<{ category: string }>(
    sql`SELECT DISTINCT "category" FROM film`
  );

  // Map the rows safely with TypeScript knowing the structure
  return categories.rows.map((row) => row.category);
}

/**
 * Collaborative Filtering: Find similar users based on interactions and recommend films.
 * @param userId - The ID of the current user.
 */
async function collaborativeFiltering(userId: string) {
  // Fetch films that the current user has interacted with
  const userInteractionsData = await db
    .select({
      filmId: userInteractions.filmId,
    })
    .from(userInteractions)
    .where(eq(userInteractions.userId, userId));

  // Example: Find films watched by other users who liked similar films
  if (userInteractionsData.length === 0) {
    return []; // Return empty array if no interactions exist
  }

  const similarUserFilms = await db
    .select({
      filmId: userInteractions.filmId,
    })
    .from(userInteractions)
    .where(
      or(
        ...userInteractionsData.map((interaction) =>
          eq(userInteractions.filmId, interaction.filmId)
        )
      )
    )
    .limit(10);

  return similarUserFilms.map((interaction) => interaction.filmId);
}

/**
 * Content-Based Filtering: Recommend films similar to those the user interacted with.
 * @param userId - The ID of the current user.
 */
async function contentBasedFiltering(userId: string) {
  // Fetch the films in the user's watchlist
  const userWatchedFilms = await db
    .select({
      filmId: watchLists.filmId,
    })
    .from(watchLists)
    .where(eq(watchLists.userId, userId));

  if (userWatchedFilms.length === 0) {
    // If the user hasn't watched any films, return top-rated films as a fallback
    return await getTopRatedFilms();
  }

  // Get film details for all watched films
  const filmsWatched = await Promise.all(
    userWatchedFilms.map((watched) => getFilmById(watched.filmId))
  );

  // Recommend films in the same category or similar attributes
  const recommendedFilms = await db
    .select({
      id: film.id,
      title: film.title,
      age: film.age,
      duration: film.duration,
      imageString: film.imageString,
      overview: film.overview,
      release: film.release,
      videoSource: film.videoSource,
      category: film.category,
      youtubeString: film.youtubeString,
      rank: film.rank,
    })
    .from(film)
    .where(
      or(
        ...filmsWatched.map((m) => eq(film.category, m.category))
      )
    )
    .orderBy(desc(film.rank)) // Sort by rank or any other metric
    .limit(10);

  return recommendedFilms;
}

/**
 * Hybrid Recommendation: Combine collaborative and content-based filtering.
 * @param userId - The ID of the current user.
 */
export async function hybridRecommendation(userId: string) {
  const collaborativeFilms = await collaborativeFiltering(userId);
  const contentFilms = await contentBasedFiltering(userId);

  // Combine results from both approaches and deduplicate film IDs
  const recommendedFilmsIds = new Set([
    ...collaborativeFilms,
    ...contentFilms.map((f) => f.id),
  ]);

  // Fetch full film details for each recommended film
  const recommendedFilms = await Promise.all(
    Array.from(recommendedFilmsIds).map((filmId) => getFilmById(filmId))
  );

  // Return the list of recommended films
  return recommendedFilms;
}

/**
 * API Handler: Provides film recommendations for the given user.
 * @param req - The API request object.
 * @param res - The API response object.
 */
export default async function handler(req: any, res: any) {
  const { userId } = req.query;

  // Ensure that userId is provided in the request
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Fetch the recommended films using the hybrid recommendation system
    const recommendations = await hybridRecommendation(userId as string);

    // Return the recommended films as a response
    return res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return res.status(500).json({ error: "Failed to fetch recommendations" });
  }
}
