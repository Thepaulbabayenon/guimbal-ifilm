import { db } from "@/db/drizzle";
import { film, userInteractions, watchLists } from "@/db/schema";
import { eq, and, desc, like, or, sql, inArray } from "drizzle-orm";

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
  trailer: string;
  rank: number;
  userId?: string;
  createdAt?: string;
  producer?: string;
  director?: string;
  coDirector?: string;
  studio?: string;
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
      trailer: film.trailer,
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
      trailer: film.trailer,
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
      trailer: film.trailer,
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
      trailer: film.trailer,
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
      trailer: film.trailer,
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
      trailer: film.trailer,
      rank: film.rank,
    })
    .from(film)
    .where(eq(film.category, 'Folklore')) // Filter by category "Folklore"
    .orderBy(desc(film.release)); // Sort by release date in descending order

  return folkloreFilmsData;
}

export async function getFilmsByCategory(category: string) {
  try {
    const response = await fetch(`/api/films?category=${category}`);
    const data = await response.json();
    return data.films || []; // Ensure we return an empty array if no films are found
  } catch (error) {
    console.error("Error fetching films by category:", error);
    return [];
  }
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
      trailer: film.trailer,
      rank: film.rank,
    })
    .from(film)
    .where(eq(film.category, 'Comedy')) // Filter by category "Comedy"
    .orderBy(desc(film.release)); // Sort by release date in descending order

  return comedyFilmsData;
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
      trailer: film.trailer,
      rank: film.rank
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
      trailer: film.trailer,
      rank: film.rank, // External rating
    }));
  } catch (error) {
    console.error("Error fetching recommended films:", error);
    return [];
  }
}

/**
 * Collaborative Filtering: Find similar users based on interactions and recommend films.
 * @param userId - The ID of the current user.
 */
async function collaborativeFiltering(userId: string) {
  try {
    // Fetch films that the current user has interacted with
    const userInteractionsData = await db
      .select({
        filmId: userInteractions.filmId,
      })
      .from(userInteractions)
      .where(eq(userInteractions.userId, userId));

    // Return an empty array if no interactions exist
    if (userInteractionsData.length === 0) {
      console.log(`No interactions found for user: ${userId}`);
      return [];
    }

    // Fetch films watched by other users who interacted with the same films
    const filmIds = userInteractionsData.map((interaction) => interaction.filmId);
    const similarUserFilms = await db
      .select({
        filmId: userInteractions.filmId,
      })
      .from(userInteractions)
      .where(inArray(userInteractions.filmId, filmIds))
      .limit(10);

    console.log(`Collaborative recommendations for user ${userId}:`, similarUserFilms);

    return similarUserFilms.map((interaction) => interaction.filmId);
  } catch (error) {
    console.error("Error in collaborativeFiltering:", error);
    throw new Error("Failed to fetch collaborative recommendations");
  }
}

/**
 * Content-Based Filtering: Recommend films similar to those the user interacted with.
 * @param userId - The ID of the current user.
 */
async function contentBasedFiltering(userId: string) {
  try {
    // Fetch the films in the user's watchlist
    const userWatchedFilms = await db
      .select({
        filmId: watchLists.filmId,
      })
      .from(watchLists)
      .where(eq(watchLists.userId, userId));

    console.log("User's watched films:", userWatchedFilms);

    // Fallback: Return top-rated films if the user hasn't watched any films
    if (userWatchedFilms.length === 0) {
      console.log(`No watchlist found for user: ${userId}, fetching top-rated films`);
      const topRated = await getTopRatedFilms();
      console.log("Top-rated films fetched:", topRated);
      return topRated;
    }

    // Get unique categories from watched films for recommendations
    const categories = await db
      .select({
        category: film.category,
      })
      .from(film)
      .where(inArray(film.id, userWatchedFilms.map((f) => f.filmId)));

    console.log("Categories fetched:", categories);

    const categoryList = categories.map((c) => c.category);

    // Fallback for no matching categories
    if (categoryList.length === 0) {
      console.log("No categories found, returning top-rated films as fallback");
      return await getTopRatedFilms();
    }

    // Recommend films in the same categories
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
        trailer: film.trailer,
        rank: film.rank,
      })
      .from(film)
      .where(inArray(film.category, categoryList))
      .orderBy(desc(film.rank)) // Sort by rank
      .limit(10);

    console.log(`Content-based recommendations for user ${userId}:`, recommendedFilms);

    return recommendedFilms;
  } catch (error) {
    console.error("Error in contentBasedFiltering:", error);
    throw new Error("Failed to fetch content-based recommendations");
  }
}

/**
 * Hybrid Recommendation: Combine collaborative and content-based filtering.
 * @param userId - The ID of the current user.
 */
export async function hybridRecommendation(userId: string) {
  try {
    console.log("Starting hybrid recommendation for userId:", userId);

    // Define the type for film IDs and films
    type FilmId = number;
    let collaborativeFilms: FilmId[] = []; // Explicitly typed as an array of Film IDs
    let contentFilms: Film[] = []; // Explicitly typed as an array of Film objects

    // Fetch recommendations from collaborative filtering
    try {
      collaborativeFilms = await collaborativeFiltering(userId);
      console.log("Collaborative films fetched:", collaborativeFilms);
    } catch (err) {
      console.error("Error in collaborativeFiltering:", err);
    }

    // Fetch recommendations from content-based filtering
    try {
      contentFilms = await contentBasedFiltering(userId);
      console.log("Content-based films fetched:", contentFilms);
    } catch (err) {
      console.error("Error in contentBasedFiltering:", err);
    }

    // Combine results from both approaches and deduplicate film IDs
    const recommendedFilmsIds = new Set<FilmId>([
      ...collaborativeFilms,
      ...contentFilms.map((f) => f.id),
    ]);
    console.log("Combined film IDs:", Array.from(recommendedFilmsIds));

    // Limit to a maximum of 8 films
    const limitedRecommendations = Array.from(recommendedFilmsIds).slice(0, 8);
    console.log("Limited recommendations (IDs):", limitedRecommendations);

    // Fetch full film details for each recommended film
    const recommendedFilms = await Promise.all(
      limitedRecommendations.map(async (filmId) => {
        try {
          const film = await getFilmById(filmId);
          console.log(`Fetched details for filmId ${filmId}:`, film);
          return film;
        } catch (error) {
          console.error(`Error fetching details for filmId ${filmId}:`, error);
          throw error;
        }
      })
    );

    console.log("Final recommended films:", recommendedFilms);
    return recommendedFilms;
  } catch (error) {
    console.error("Error in hybrid recommendation:", error);
    throw new Error("Failed to fetch hybrid recommendations");
  }
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
    let recommendations: any[] = []; // To store the final recommendations

    // Attempt collaborative filtering
    try {
      console.log("Trying collaborative filtering...");
      const collaborativeFilms = await collaborativeFiltering(userId as string);
      console.log("Collaborative recommendations fetched:", collaborativeFilms);

      if (collaborativeFilms.length > 0) {
        recommendations = await Promise.all(
          collaborativeFilms.map((filmId) => getFilmById(filmId))
        );
        return res.status(200).json(recommendations.slice(0, 8)); // Limit to 8 films
      }
    } catch (collabError) {
      console.error("Collaborative filtering failed:", collabError);
    }

    // Fallback to content-based filtering
    try {
      console.log("Trying content-based filtering...");
      const contentFilms = await contentBasedFiltering(userId as string);
      console.log("Content-based recommendations fetched:", contentFilms);

      if (contentFilms.length > 0) {
        recommendations = contentFilms; // Already fetched as full objects
        return res.status(200).json(recommendations.slice(0, 8)); // Limit to 8 films
      }
    } catch (contentError) {
      console.error("Content-based filtering failed:", contentError);
    }

    // Final fallback to hybrid recommendations
    try {
      console.log("Trying hybrid recommendations...");
      recommendations = await hybridRecommendation(userId as string);
      console.log("Hybrid recommendations fetched:", recommendations);

      return res.status(200).json(recommendations.slice(0, 8)); // Limit to 8 films
    } catch (hybridError) {
      console.error("Hybrid recommendation failed:", hybridError);
    }

    // If all methods fail, return an empty array
    return res.status(200).json([]);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return res.status(500).json({ error: "Failed to fetch recommendations" });
  }
}
