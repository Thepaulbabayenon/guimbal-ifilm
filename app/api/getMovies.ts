import { db } from "@/db/drizzle";
import { movie, userInteractions, watchLists } from "@/db/schema";
import { eq, and, desc, like, or } from "drizzle-orm";


// Define the Movie type (you can adjust fields to match your database schema)
interface Movie {
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
 * Fetch all movies from the database.
 */
export async function getAllMovies() {
  console.log("Fetching all movies");

  const moviesData = await db
    .select({
      id: movie.id,
      title: movie.title,
      age: movie.age,
      duration: movie.duration,
      imageString: movie.imageString,
      overview: movie.overview,
      release: movie.release,
      videoSource: movie.videoSource,
      category: movie.category,
      youtubeString: movie.youtubeString,
      rank: movie.rank,
    })
    .from(movie)
    .orderBy(desc(movie.release)); // Sort by release date in descending order

  return moviesData;
}

/**
 * Fetch a specific movie by ID.
 * @param movieId - The ID of the movie to fetch.
 */
export async function getMovieById(movieId: number) {
  console.log("Fetching movie with ID:", movieId);

  const movieData = await db
    .select({
      id: movie.id,
      title: movie.title,
      age: movie.age,
      duration: movie.duration,
      imageString: movie.imageString,
      overview: movie.overview,
      release: movie.release,
      videoSource: movie.videoSource,
      category: movie.category,
      youtubeString: movie.youtubeString,
      rank: movie.rank,
    })
    .from(movie)
    .where(eq(movie.id, movieId))
    .limit(1);

  if (movieData.length === 0) {
    throw new Error("Movie not found");
  }

  return movieData[0];
}

/**
 * Fetch movies based on a search term.
 * @param searchTerm - The term to search for in movie titles or categories.
 */
export async function searchMovies(searchTerm: string) {
  console.log("Searching for movies with term:", searchTerm);

  const moviesData = await db
    .select({
      id: movie.id,
      title: movie.title,
      age: movie.age,
      duration: movie.duration,
      imageString: movie.imageString,
      overview: movie.overview,
      release: movie.release,
      videoSource: movie.videoSource,
      category: movie.category,
      youtubeString: movie.youtubeString,
      rank: movie.rank,
    })
    .from(movie)
    .where(
      or(
        like(movie.title, `%${searchTerm}%`),
        like(movie.category, `%${searchTerm}%`)
      )
    )
    .orderBy(desc(movie.release)); // Sort by release date in descending order

  return moviesData;
}

/**
 * Fetch top-rated movies.
 * This function returns the top 10 movies based on their rank.
 */
export async function getTopRatedMovies() {
  console.log("Fetching top-rated movies");

  const topRatedMoviesData = await db
    .select({
      id: movie.id,
      title: movie.title,
      age: movie.age,
      duration: movie.duration,
      imageString: movie.imageString,
      overview: movie.overview,
      release: movie.release,
      videoSource: movie.videoSource,
      category: movie.category,
      youtubeString: movie.youtubeString,
      rank: movie.rank,
    })
    .from(movie)
    .orderBy(desc(movie.rank)) // Sort by rank in descending order
    .limit(10);

  return topRatedMoviesData;
}

/**
 * Fetch horror movies.
 * This function returns all movies that belong to the horror category.
 */
export async function getHorrorMovies() {
  console.log("Fetching horror movies");

  const horrorMoviesData = await db
    .select({
      id: movie.id,
      title: movie.title,
      age: movie.age,
      duration: movie.duration,
      imageString: movie.imageString,
      overview: movie.overview,
      release: movie.release,
      videoSource: movie.videoSource,
      category: movie.category,
      youtubeString: movie.youtubeString,
      rank: movie.rank,
    })
    .from(movie)
    .where(eq(movie.category, 'Horror')) // Filter by category "Horror"
    .orderBy(desc(movie.release)); // Sort by release date in descending order

  return horrorMoviesData;
}

/**
 * Fetch folklore movies.
 * This function returns all movies that belong to the folklore category.
 */
export async function getFolkloreMovies() {
  console.log("Fetching folklore movies");

  const folkloreMoviesData = await db
    .select({
      id: movie.id,
      title: movie.title,
      age: movie.age,
      duration: movie.duration,
      imageString: movie.imageString,
      overview: movie.overview,
      release: movie.release,
      videoSource: movie.videoSource,
      category: movie.category,
      youtubeString: movie.youtubeString,
      rank: movie.rank,
    })
    .from(movie)
    .where(eq(movie.category, 'Folklore')) // Filter by category "Folklore"
    .orderBy(desc(movie.release)); // Sort by release date in descending order

  return folkloreMoviesData;
}

/**
 * Fetch comedy movies.
 * This function returns all movies that belong to the comedy category.
 */
export async function getComedyMovies() {
  console.log("Fetching comedy movies");

  const comedyMoviesData = await db
    .select({
      id: movie.id,
      title: movie.title,
      age: movie.age,
      duration: movie.duration,
      imageString: movie.imageString,
      overview: movie.overview,
      release: movie.release,
      videoSource: movie.videoSource,
      category: movie.category,
      youtubeString: movie.youtubeString,
      rank: movie.rank,
    })
    .from(movie)
    .where(eq(movie.category, 'Comedy')) // Filter by category "Comedy"
    .orderBy(desc(movie.release)); // Sort by release date in descending order

  return comedyMoviesData;
}

export async function getRecommendedMovies(userId: string): Promise<Movie[]> {
  try {
    const response = await fetch(`http://localhost:3000/api/recommendations?userId=${userId}`);
    const data = await response.json();

    return data.movies.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      age: movie.age,
      duration: movie.duration,
      imageString: movie.imageString,
      overview: movie.overview,
      release: movie.release,
      videoSource: movie.videoSource,
      category: movie.category,
      youtubeString: movie.youtubeString,
      rank: movie.rank, // External rating
    }));
  } catch (error) {
    console.error("Error fetching recommended movies:", error);
    return [];
  }
}


/**
 * Fetch drama movies.
 * This function returns all movies that belong to the drama category.
 */
export async function getDramaMovies() {
  console.log("Fetching drama movies");

  const dramaMoviesData = await db
    .select({
      id: movie.id,
      title: movie.title,
      age: movie.age,
      duration: movie.duration,
      imageString: movie.imageString,
      overview: movie.overview,
      release: movie.release,
      videoSource: movie.videoSource,
      category: movie.category,
      youtubeString: movie.youtubeString,
      rank: movie.rank,
    })
    .from(movie)
    .where(eq(movie.category, 'Drama')) // Filter by category "Drama"
    .orderBy(desc(movie.release)); // Sort by release date in descending order

  return dramaMoviesData;
}


/**
 * Collaborative Filtering: Find similar users based on interactions and recommend movies.
 * @param userId - The ID of the current user.
 */
async function collaborativeFiltering(userId: string) {
  // Fetch movies that the current user has interacted with
  const userInteractionsData = await db
    .select({
      movieId: userInteractions.movieId,
    })
    .from(userInteractions)
    .where(eq(userInteractions.userId, userId));

  // Example: Find movies watched by other users who liked similar movies
  if (userInteractionsData.length === 0) {
    return []; // Return empty array if no interactions exist
  }

  const similarUserMovies = await db
    .select({
      movieId: userInteractions.movieId,
    })
    .from(userInteractions)
    .where(
      or(
        ...userInteractionsData.map((interaction) =>
          eq(userInteractions.movieId, interaction.movieId)
        )
      )
    )
    .limit(10);

  return similarUserMovies.map((interaction) => interaction.movieId);
}

/**
 * Content-Based Filtering: Recommend movies similar to those the user interacted with.
 * @param userId - The ID of the current user.
 */
async function contentBasedFiltering(userId: string) {
  // Fetch the movies in the user's watchlist
  const userWatchedMovies = await db
    .select({
      movieId: watchLists.movieId,
    })
    .from(watchLists)
    .where(eq(watchLists.userId, userId));

  if (userWatchedMovies.length === 0) {
    // If the user hasn't watched any movies, return top-rated movies as a fallback
    return await getTopRatedMovies();
  }

  // Get movie details for all watched movies
  const moviesWatched = await Promise.all(
    userWatchedMovies.map((watched) => getMovieById(watched.movieId))
  );

  // Recommend movies in the same category or similar attributes
  const recommendedMovies = await db
    .select({
      id: movie.id,
      title: movie.title,
      age: movie.age,
      duration: movie.duration,
      imageString: movie.imageString,
      overview: movie.overview,
      release: movie.release,
      videoSource: movie.videoSource,
      category: movie.category,
      youtubeString: movie.youtubeString,
      rank: movie.rank,
    })
    .from(movie)
    .where(
      or(
        ...moviesWatched.map((m) => eq(movie.category, m.category))
      )
    )
    .orderBy(desc(movie.rank)) // Sort by rank or any other metric
    .limit(10);

  return recommendedMovies;
}

/**
 * Hybrid Recommendation: Combine collaborative and content-based filtering.
 * @param userId - The ID of the current user.
 */
export async function hybridRecommendation(userId: string) {
  const collaborativeMovies = await collaborativeFiltering(userId);
  const contentMovies = await contentBasedFiltering(userId);

  // Combine results from both approaches and deduplicate movie IDs
  const recommendedMoviesIds = new Set([
    ...collaborativeMovies,
    ...contentMovies.map((m) => m.id),
  ]);

  // Fetch full movie details for each recommended movie
  const recommendedMovies = await Promise.all(
    Array.from(recommendedMoviesIds).map((movieId) => getMovieById(movieId))
  );

  // Return the list of recommended movies
  return recommendedMovies;
}

/**
 * API Handler: Provides movie recommendations for the given user.
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
    // Fetch the recommended movies using the hybrid recommendation system
    const recommendations = await hybridRecommendation(userId as string);

    // Return the recommended movies as a response
    return res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return res.status(500).json({ error: "Failed to fetch recommendations" });
  }
}

