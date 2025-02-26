import { db } from "@/app/db/drizzle";
import { film, userInteractions, watchLists, userRatings, accounts, watchedFilms} from "@/app/db/schema";
import { eq, and, desc, like, or, sql, inArray, asc, avg } from "drizzle-orm";

export const dynamic = "force-dynamic";


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

  // Map data to match the expected Film structure
  const films = filmsData.map((film) => ({
    ...film,
    watchList: false,            // Default value for watchList
    trailerUrl: film.trailer,    // Map the trailer directly
    year: new Date(film.release).getFullYear(), // Extract year from release date
    time: film.duration,         // Map the duration as the time in minutes
    initialRatings: 0,           // Default value for initial ratings
  }));

  return films;
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

export async function getRecentlyAdded(userId: string) {
  try {
    const userFilms = await db
      .select({
        id: film.id,
        overview: film.overview,
        title: film.title,
        WatchList: {
          userId: accounts.userId,
          filmId: film.id,
        },
        imageString: film.imageString,
        trailer: film.trailer,
        age: film.age,
        release: film.release,
        duration: film.duration,
        category: film.category,
        // Aggregation to calculate average rating using avg()
        averageRating: avg(userRatings.rating).as('averageRating'),
      })
      .from(film)
      .leftJoin(accounts, eq(accounts.userId, userId))
      .leftJoin(userRatings, eq(userRatings.filmId, film.id))
      .groupBy(film.id, accounts.userId) // Group by both film.id and accounts.userId
      .orderBy(asc(avg(userRatings.rating))) // Order by the calculated average rating
      .limit(4); // Limit the results to top 4

    return userFilms;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Error fetching films from the database. Please try again later.");
  }
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

export async function getAllFilmsWithDetails(userId: string): Promise<Film[]> {
  // Fetch films and additional data in parallel
  const filmsResponse = await fetch("http://localhost:3000/api/films");
  const films: Film[] = await filmsResponse.json();

  const userWatchlistResponse = await fetch(`http://localhost:3000/api/watchlist?userId=${userId}`);
  const userWatchlist: number[] = await userWatchlistResponse.json(); // Array of film IDs in watchlist

  const userRatingsResponse = await fetch(`http://localhost:3000/api/user-ratings?userId=${userId}`);
  const userRatings: Record<number, number> = await userRatingsResponse.json(); // Map of film ID to user rating

  const averageRatingsResponse = await fetch(`http://localhost:3000/api/average-ratings`);
  const averageRatings: Record<number, number> = await averageRatingsResponse.json(); // Map of film ID to average rating

  // Merge additional data into films
  return films.map((film: Film) => ({
    ...film,
    inWatchlist: userWatchlist.includes(film.id),
    userRating: userRatings[film.id] || 0,
    averageRating: averageRatings[film.id] || 0,
  }));
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

type FilmId = number;

async function collaborativeFiltering(userId: string) {
  try {
    const userInteractionsData = await db
      .select({ filmId: userInteractions.filmId })
      .from(userInteractions)
      .where(eq(userInteractions.userId, userId));

    if (userInteractionsData.length === 0) {
      console.log(`No interactions found for user: ${userId}`);
      return [];
    }

    const filmIds = userInteractionsData.map((interaction) => interaction.filmId);
    const similarUserFilms = await db
      .select({ filmId: userInteractions.filmId })
      .from(userInteractions)
      .where(inArray(userInteractions.filmId, filmIds))
      .limit(8);

    console.log(`Collaborative recommendations for user ${userId}:`, similarUserFilms);

    return similarUserFilms.map((interaction) => ({ id: interaction.filmId }));
  } catch (error) {
    console.error("Error in collaborativeFiltering:", error);
    throw new Error("Failed to fetch collaborative recommendations");
  }
}

async function contentBasedFiltering(userId: string) {
  try {
    const userWatchedFilms = await db
      .select({ filmId: watchLists.filmId })
      .from(watchLists)
      .where(eq(watchLists.userId, userId));

    if (userWatchedFilms.length === 0) {
      return await getTopRatedFilms();
    }

    const categories = await db
      .select({ category: film.category })
      .from(film)
      .where(inArray(film.id, userWatchedFilms.map((f) => f.filmId)));

    const categoryList = categories.map((c) => c.category);

    if (categoryList.length === 0) {
      return await getTopRatedFilms();
    }

    return await db
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
      .orderBy(desc(film.rank))
      .limit(8);
  } catch (error) {
    console.error("Error in contentBasedFiltering:", error);
    throw new Error("Failed to fetch content-based recommendations");
  }
}

export async function hybridRecommendation(userId: string) {
  try {
    console.log("🔄 Starting hybrid recommendation for user:", userId);

    let collaborativeFilms: { id: number; title?: string }[] = [];
    let contentFilms: { id: number; title: string }[] = [];
    let userInteractionsData: { filmId: number; title: string; ratings: number }[] = [];
    let watchlistFilms: { id: number; title: string }[] = [];
    let watchedFilmsData: { filmId: number; title: string; timestamp: Date }[] = [];

    // Fetch user interactions (ratings)
    try {
      userInteractionsData = await db
        .select({
          filmId: userInteractions.filmId,
          title: sql<string>`COALESCE(${film.title}, '')`,
          ratings: userInteractions.ratings,
        })
        .from(userInteractions)
        .leftJoin(film, eq(userInteractions.filmId, film.id))
        .where(eq(userInteractions.userId, userId))
        .orderBy(desc(userInteractions.timestamp))
        .limit(1);
    } catch (error) {
      console.error("❌ Error fetching user interactions:", error);
    }

    // Fetch user's watchlist (liked films)
    try {
      watchlistFilms = await db
        .select({
          id: watchLists.filmId,
          title: sql<string>`COALESCE(${film.title}, '')`,
        })
        .from(watchLists)
        .leftJoin(film, eq(watchLists.filmId, film.id))
        .where(eq(watchLists.userId, userId));
    } catch (error) {
      console.error("❌ Error fetching watchlist:", error);
    }

    // Fetch user's watched films (most recent)
    try {
      watchedFilmsData = await db
        .select({
          filmId: watchedFilms.filmId,
          title: sql<string>`COALESCE(${film.title}, '')`,
          timestamp: watchedFilms.timestamp,
        })
        .from(watchedFilms)
        .leftJoin(film, eq(watchedFilms.filmId, film.id))
        .where(eq(watchedFilms.userId, userId))
        .orderBy(desc(watchedFilms.timestamp))
        .limit(1);
    } catch (error) {
      console.error("❌ Error fetching watched films:", error);
    }

    // Fetch collaborative filtering recommendations
    try {
      collaborativeFilms = await collaborativeFiltering(userId);
    } catch (error) {
      console.error("❌ Error in collaborativeFiltering:", error);
    }

    // Fetch content-based filtering recommendations
    try {
      contentFilms = await contentBasedFiltering(userId);
    } catch (error) {
      console.error("❌ Error in contentBasedFiltering:", error);
    }

    // Combine all recommendations into a set to avoid duplicates
    const filmMap = new Map<number, { id: number; title?: string }>();
    collaborativeFilms.forEach((film) => filmMap.set(film.id, film));
    contentFilms.forEach((film) => filmMap.set(film.id, film));
    watchlistFilms.forEach((film) => filmMap.set(film.id, film));

    let recommendedFilms = Array.from(filmMap.values());

    // Ensure we have at least 32 films, fetching top-rated if needed
    if (recommendedFilms.length < 32) {
      const extraFilms = await getTopRatedFilms();
      recommendedFilms.push(...extraFilms.slice(0, 32 - recommendedFilms.length));
    }

    // Slice to ensure exactly 32 films
    recommendedFilms = recommendedFilms.slice(0, 32);

    // Generate dynamic reasons for recommendations
    let reason1 = "Because you liked similar films";
    let reason2 = "Based on popular films";
    let reason3 = "Because you saved films to watch later";
    let reason4 = "Because you recently watched...";

    if (userInteractionsData.length > 0) {
      const lastInteraction = userInteractionsData[0];
      if (lastInteraction.ratings >= 4) {
        reason1 = `You rated "${lastInteraction.title}" highly`;
      } else {
        reason1 = `Because you watched "${lastInteraction.title}"`;
      }
    }

    if (watchedFilmsData.length > 0) {
      reason4 = `Because you recently watched "${watchedFilmsData[0].title}"`;
    }

    // Return structured recommendation response
    return [
      {
        reason: reason1,
        films: recommendedFilms.slice(0, 8),
      },
      {
        reason: reason2,
        films: recommendedFilms.slice(8, 16),
      },
      {
        reason: reason3,
        films: recommendedFilms.slice(16, 24),
      },
      {
        reason: reason4,
        films: recommendedFilms.slice(24, 32),
      },
    ];
  } catch (error) {
    console.error("❌ Error in hybrid recommendation:", error);
    throw new Error("Failed to fetch hybrid recommendations");
  }
}


export default async function handler(req: any, res: any) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    let recommendations: any[] = [];

    try {
      const collaborativeFilms = await collaborativeFiltering(userId as string);

      if (collaborativeFilms.length > 0) {
        recommendations = await Promise.all(
          collaborativeFilms.map((film) => getFilmById(film.id)) // Extract id
        );
        return res.status(200).json(recommendations.slice(0, 8));
      }
    } catch (collabError) {
      console.error("Collaborative filtering failed:", collabError);
    }

    try {
      const contentFilms = await contentBasedFiltering(userId as string);
      if (contentFilms.length > 0) {
        return res.status(200).json(contentFilms.slice(0, 8));
      }
    } catch (contentError) {
      console.error("Content-based filtering failed:", contentError);
    }

    try {
      recommendations = await hybridRecommendation(userId as string);
      return res.status(200).json(recommendations.slice(0, 8));
    } catch (hybridError) {
      console.error("Hybrid recommendation failed:", hybridError);
    }

    return res.status(200).json([]);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return res.status(500).json({ error: "Failed to fetch recommendations" });
  }
}
