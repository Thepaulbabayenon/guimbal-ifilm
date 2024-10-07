import { db } from "@/db/drizzle";
import { movie, userInteractions, watchLists } from "@/db/schema";
import { eq, and, desc, like, or } from "drizzle-orm";

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
