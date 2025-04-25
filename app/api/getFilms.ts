import { db } from "@/app/db/drizzle";
import { film, userInteractions, watchLists, userRatings, watchedFilms} from "@/app/db/schema";
import { eq, and, desc, like, or, sql, inArray, asc, avg } from "drizzle-orm";
import { Film } from "@/types/film";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.Thebantayanfilmfestival.com';



/**
 * Fetch all films from the database.
 */
export async function getAllFilms(branch?: string) {
  console.log("Fetching all films");

  const filmsData = await db
    .select({
      id: film.id,
      title: film.title,
      ageRating: film.ageRating,
      duration: film.duration,
      imageUrl: film.imageUrl,
      overview: film.overview,
      releaseYear: film.releaseYear,
      videoSource: film.videoSource,
      category: film.category,
      trailerUrl: film.trailerUrl,
      rank: film.rank,
      averageRatings: film.averageRating
    })
    .from(film)
    .orderBy(desc(film.releaseYear)); 

  // Map data to match the expected Film structure
  const films = filmsData.map((film) => ({
    ...film,
    watchList: false,            
    trailerUrl: film.trailerUrl,    
    releaseYear: new Date(film.releaseYear).getFullYear(), 
    time: film.duration,       
    initialRatings: 0,         
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
      ageRating: film.ageRating,
      duration: film.duration,
      imageUrl: film.imageUrl,
      overview: film.overview,
      releaseYear: film.releaseYear,
      videoSource: film.videoSource,
      category: film.category,
      trailerUrl: film.trailerUrl,
      rank: film.rank,
      averageRating: film.averageRating,
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
      ageRating: film.ageRating,
      duration: film.duration,
      imageUrl: film.imageUrl,
      overview: film.overview,
      releaseYear: film.releaseYear,
      videoSource: film.videoSource,
      category: film.category,
      trailerUrl: film.trailerUrl,
      rank: film.rank,
      averageRating: film.averageRating,
    })
    .from(film)
    .where(
      or(
        like(film.title, `%${searchTerm}%`),
        like(film.category, `%${searchTerm}%`)
      )
    )
    .orderBy(desc(film.releaseYear)); 

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
      ageRating: film.ageRating,
      duration: film.duration,
      imageUrl: film.imageUrl,
      overview: film.overview,
      releaseYear: film.releaseYear,
      videoSource: film.videoSource,
      category: film.category,
      trailerUrl: film.trailerUrl,
      rank: film.rank,
      averageRating: film.averageRating,
    })
    .from(film)
    .orderBy(desc(film.rank))
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
      ageRating: film.ageRating,
      duration: film.duration,
      imageUrl: film.imageUrl,
      overview: film.overview,
      releaseYear: film.releaseYear,
      videoSource: film.videoSource,
      category: film.category,
      trailerUrl: film.trailerUrl,
      rank: film.rank,
      averageRating: film.averageRating,
    })
    .from(film)
    .where(eq(film.category, 'Horror')) 
    .orderBy(desc(film.releaseYear)); 

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
          userId: watchLists.userId,
          filmId: film.id,
        },
        imageUrl: film.imageUrl,
        trailer: film.trailerUrl,
        ageRating: film.ageRating,
        releaseYear: film.releaseYear,
        duration: film.duration,
        category: film.category,
        averageRating: avg(userRatings.rating).as('averageRating'),
      })
      .from(film)
      .leftJoin(watchLists, and(
        eq(watchLists.filmId, film.id),
        eq(watchLists.userId, userId)
      ))
      .leftJoin(userRatings, eq(userRatings.filmId, film.id))
      .groupBy(film.id, watchLists.userId) 
      .orderBy(asc(avg(userRatings.rating))) 
      .limit(4); 

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
      ageRating: film.ageRating,
      duration: film.duration,
      imageUrl: film.imageUrl,
      overview: film.overview,
      releaseYear: film.releaseYear,
      videoSource: film.videoSource,
      category: film.category,
      trailerUrl: film.trailerUrl,
      rank: film.rank,
      averageRating: film.averageRating,
    })
    .from(film)
    .where(eq(film.category, 'Folklore')) 
    .orderBy(desc(film.releaseYear));

  return folkloreFilmsData;
}

export async function getFilmsByCategory(category: string) {
  try {
    const response = await fetch(`/api/films?category=${category}`);
    const data = await response.json();
    return data.films || []; 
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
      ageRating: film.ageRating,
      duration: film.duration,
      imageUrl: film.imageUrl,
      overview: film.overview,
      releaseYear: film.releaseYear,
      videoSource: film.videoSource,
      category: film.category,
      trailerUrl: film.trailerUrl,
      rank: film.rank,
      averageRating: film.averageRating,
    })
    .from(film)
    .where(eq(film.category, 'Comedy')) 
    .orderBy(desc(film.releaseYear)); 

  return comedyFilmsData;
}

export async function getAllFilmsWithDetails(userId: string): Promise<Film[]> {
 
  const filmsResponse = await fetch(`${baseUrl}/api/films`);
  const films: Film[] = await filmsResponse.json();

  const userWatchlistResponse = await fetch(`${baseUrl}/api/watchlist?userId=${userId}`);
  const userWatchlist: number[] = await userWatchlistResponse.json(); 

  const userRatingsResponse = await fetch(`${baseUrl}/api/user-ratings?userId=${userId}`);
  const userRatings: Record<number, number> = await userRatingsResponse.json(); 

  const averageRatingsResponse = await fetch(`${baseUrl}/api/average-ratings`);
  const averageRatings: Record<number, number> = await averageRatingsResponse.json();

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
      ageRating: film.ageRating,
      duration: film.duration,
      imageUrl: film.imageUrl,
      overview: film.overview,
      releaseYear: film.releaseYear,
      videoSource: film.videoSource,
      category: film.category,
      trailerUrl: film.trailerUrl,
      rank: film.rank,
      averageRating: film.averageRating,
    })
    .from(film)
    .where(eq(film.category, 'Drama')) 
    .orderBy(desc(film.releaseYear)); 

  return dramaFilmsData;
}

export async function fetchCategories() {

  const categories = await db.execute<{ category: string }>(
    sql`SELECT DISTINCT "category" FROM film`
  );

 
  return categories.rows.map((row) => row.category);
}

export async function getRecommendedFilms(userId: string): Promise<Film[]> {
  try {
    const response = await fetch(`${baseUrl}/api/recommendations?userId=${userId}`);
    const data = await response.json();

    return data.films.map((film: any) => ({
      id: film.id,
      title: film.title,
      ageRating: film.ageRating,
      duration: film.duration,
      imageUrl: film.imageUrl,
      overview: film.overview,
      releaseYear: film.releaseYear,
      videoSource: film.videoSource,
      category: film.category,
      trailerUrl: film.trailerUrl,
      rank: film.rank,
      averageRating: film.averageRating,
    }));
  } catch (error) {
    console.error("Error fetching recommended films:", error);
    return [];
  }
}

type FilmId = number;


// Matrix factorization implementation for movie recommendations
async function matrixFactorization(userId: string, latentFactors: number = 10, iterations: number = 20, learningRate: number = 0.01, regularization: number = 0.02) {
  try {
    // Get all user-film interactions for training
    const allInteractions = await db
      .select({
        userId: userInteractions.userId,
        filmId: userInteractions.filmId,
        rating: userInteractions.ratings,
      })
      .from(userInteractions)
      .where(sql`${userInteractions.ratings} IS NOT NULL`);
    
    if (allInteractions.length === 0) {
      console.log("No rating data available for matrix factorization");
      return [];
    }

    // Get unique users and films
    const uniqueUsers = Array.from(new Set(allInteractions.map(i => i.userId)));
    const uniqueFilms = Array.from(new Set(allInteractions.map(i => i.filmId)));
    
    const userIdToIndex = new Map(uniqueUsers.map((id, index) => [id, index]));
    const filmIdToIndex = new Map(uniqueFilms.map((id, index) => [id, index]));
    const indexToFilmId = new Map(Array.from(filmIdToIndex).map(([id, index]) => [index, id]));
    
    // Initialize user and item latent factor matrices randomly
    const userFactors = Array(uniqueUsers.length).fill(0).map(() => 
      Array(latentFactors).fill(0).map(() => Math.random() * 0.1)
    );
    
    const itemFactors = Array(uniqueFilms.length).fill(0).map(() => 
      Array(latentFactors).fill(0).map(() => Math.random() * 0.1)
    );
    
    // Training the model using SGD
    for (let iter = 0; iter < iterations; iter++) {
      let totalError = 0;
      
      for (const interaction of allInteractions) {
        const uIndex = userIdToIndex.get(interaction.userId);
        const iIndex = filmIdToIndex.get(interaction.filmId);
        
        if (uIndex === undefined || iIndex === undefined) continue;
        
        // Predict rating
        let prediction = 0;
        for (let f = 0; f < latentFactors; f++) {
          prediction += userFactors[uIndex][f] * itemFactors[iIndex][f];
        }
        
        // Clip prediction to valid rating range (1-5)
        prediction = Math.max(1, Math.min(5, prediction));
        
        // Calculate error
        const error = interaction.rating - prediction;
        totalError += error * error;
        
        // Update latent factors
        for (let f = 0; f < latentFactors; f++) {
          const userOld = userFactors[uIndex][f];
          const itemOld = itemFactors[iIndex][f];
          
          userFactors[uIndex][f] += learningRate * (error * itemOld - regularization * userOld);
          itemFactors[iIndex][f] += learningRate * (error * userOld - regularization * itemOld);
        }
      }
      
      // Log training progress
      if (iter % 5 === 0) {
        console.log(`Matrix Factorization Iteration ${iter}, RMSE: ${Math.sqrt(totalError / allInteractions.length)}`);
      }
    }
    
    // Generate recommendations for the specific user
    const userIndex = userIdToIndex.get(userId);
    if (userIndex === undefined) {
      console.log(`User ${userId} not found in training data`);
      return [];
    }
    
    // Get films the user has already interacted with
    const userFilmIds = new Set(
      allInteractions
        .filter(i => i.userId === userId)
        .map(i => i.filmId)
    );
    
    // Calculate predicted ratings for all items
    const predictions: { filmId: number; score: number }[] = [];
    
    for (let iIndex = 0; iIndex < itemFactors.length; iIndex++) {
      const filmId = indexToFilmId.get(iIndex);
      if (filmId === undefined || userFilmIds.has(filmId)) continue;
      
      let score = 0;
      for (let f = 0; f < latentFactors; f++) {
        score += userFactors[userIndex][f] * itemFactors[iIndex][f];
      }
      
      predictions.push({ filmId, score });
    }
    
    // Sort by predicted rating and return top recommendations
    return predictions
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(p => ({ id: p.filmId }));
    
  } catch (error) {
    console.error("Error in matrixFactorization:", error);
    return [];
  }
}

async function collaborativeFiltering(userId: string) {
  try {
    // Get the films the user has interacted with
    const userInteractionsData = await db
      .select({ filmId: userInteractions.filmId })
      .from(userInteractions)
      .where(eq(userInteractions.userId, userId));

    if (userInteractionsData.length === 0) {
      console.log(`No interactions found for user: ${userId}`);
      return [];
    }

    // Find users who interacted with the same films
    const filmIds = userInteractionsData.map((interaction) => interaction.filmId);
    
    // Get similar users based on film overlap
    const similarUsers = await db
      .select({
        userId: userInteractions.userId,
        overlap: sql<number>`COUNT(DISTINCT ${userInteractions.filmId})`,
      })
      .from(userInteractions)
      .where(
        sql`${userInteractions.userId} != ${userId} AND ${userInteractions.filmId} IN (${filmIds.join(',')})`
      )
      .groupBy(userInteractions.userId)
      .orderBy(desc(sql`overlap`))
      .limit(20);
    
    if (similarUsers.length === 0) {
      return [];
    }
    
    // Get films watched by similar users but not by the current user
    const similarUserIds = similarUsers.map(u => u.userId);
    const similarUserFilms = await db
      .select({
        filmId: userInteractions.filmId,
        count: sql<number>`COUNT(DISTINCT ${userInteractions.userId})`,
        avgRating: sql<number>`AVG(${userInteractions.ratings})`,
      })
      .from(userInteractions)
      .where(
        sql`${userInteractions.userId} IN (${similarUserIds.join(',')}) AND 
            ${userInteractions.filmId} NOT IN (${filmIds.join(',')})`
      )
      .groupBy(userInteractions.filmId)
      .orderBy(desc(sql`avgRating`), desc(sql`count`))
      .limit(12);

    console.log(`Collaborative recommendations for user ${userId}:`, similarUserFilms);

    return similarUserFilms.map((interaction) => ({ id: interaction.filmId }));
  } catch (error) {
    console.error("Error in collaborativeFiltering:", error);
    return [];
  }
}

async function contentBasedFiltering(userId: string) {
  try {
    // Get user's watched films
    const userWatchedFilms = await db
      .select({ filmId: watchLists.filmId })
      .from(watchLists)
      .where(eq(watchLists.userId, userId));

    if (userWatchedFilms.length === 0) {
      return await getTopRatedFilms();
    }

    // Get categories of watched films
    const userWatchedFilmIds = userWatchedFilms.map((f) => f.filmId);
    const filmDetails = await db
      .select({
        id: film.id,
        category: film.category,
        releaseYear: film.releaseYear,
        ageRating: film.ageRating,
      })
      .from(film)
      .where(inArray(film.id, userWatchedFilmIds));

    if (filmDetails.length === 0) {
      return await getTopRatedFilms();
    }

    // Extract user preferences
    const categories = filmDetails.map(f => f.category);
    const releaseYears = filmDetails.map(f => f.releaseYear);
    const ageRatings = filmDetails.map(f => f.ageRating);
    
    // Calculate average release year preference
    const avgReleaseYear = releaseYears.reduce((sum, year) => sum + year, 0) / releaseYears.length;
    const avgReleaseYearInt = Math.floor(avgReleaseYear); // Convert to integer
    const recentYearPreference = new Date().getFullYear() - avgReleaseYear < 10;
    
    // Get recommendations based on content similarity
    return await db
      .select({
        id: film.id,
        title: film.title,
        ageRating: film.ageRating,
        duration: film.duration,
        imageUrl: film.imageUrl,
        overview: film.overview,
        releaseYear: film.releaseYear,
        videoSource: film.videoSource,
        category: film.category,
        trailerUrl: film.trailerUrl,
        rank: film.rank,
        averageRating: film.averageRating,
      })
      .from(film)
      .where(
        and(
        
          sql`NOT ${inArray(film.id, userWatchedFilmIds)}`,
          inArray(film.category, categories),
          recentYearPreference ? 
            sql`${film.releaseYear} > ${avgReleaseYearInt - 10}` :
            sql`1=1`,
          inArray(film.ageRating, ageRatings)
        )
      )
      .orderBy(desc(film.rank), desc(film.averageRating))
      .limit(12);
  } catch (error) {
    console.error("Error in contentBasedFiltering:", error);
    return await getTopRatedFilms();
  }
}

export async function hybridRecommendation(userId: string) {
  try {
    console.log("🔄 Starting enhanced hybrid recommendation for user:", userId);

    // Track start time for performance monitoring
    const startTime = Date.now();
    
    // Arrays to hold our different recommendation sources
    let matrixFactorFilms: { id: number; score?: number; title?: string }[] = [];
    let collaborativeFilms: { id: number; title?: string }[] = [];
    let contentFilms: { id: number; title: string }[] = [];
    
    // User interaction data for personalization
    let userInteractionsData: { filmId: number; title: string; ratings: number }[] = [];
    let watchlistFilms: { id: number; title: string }[] = [];
    let watchedFilmsData: { filmId: number; title: string; currentTimestamp: Date }[] = [];

    // Get user's last interaction (rating)
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

    // Get user's watchlist
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

    // Get user's recently watched films
    try {
      watchedFilmsData = await db
        .select({
          filmId: watchedFilms.filmId,
          title: sql<string>`COALESCE(${film.title}, '')`,
          currentTimestamp: sql<Date>`TO_TIMESTAMP(${watchedFilms.currentTimestamp})`,
        })
        .from(watchedFilms)
        .leftJoin(film, eq(watchedFilms.filmId, film.id))
        .where(eq(watchedFilms.userId, userId))
        .orderBy(desc(watchedFilms.currentTimestamp))
        .limit(1);
    } catch (error) {
      console.error("❌ Error fetching watched films:", error);
    }

    // Execute all recommendation strategies in parallel
    const [matrixResults, collabResults, contentResults] = await Promise.all([
      matrixFactorization(userId).catch(error => {
        console.error("❌ Error in matrixFactorization:", error);
        return [];
      }),
      collaborativeFiltering(userId).catch(error => {
        console.error("❌ Error in collaborativeFiltering:", error);
        return [];
      }),
      contentBasedFiltering(userId).catch(error => {
        console.error("❌ Error in contentBasedFiltering:", error);
        return [];
      })
    ]);
    
    matrixFactorFilms = matrixResults;
    collaborativeFilms = collabResults;
    contentFilms = contentResults;

    // Combine all recommendation sources with weights
    // The weights prioritize different algorithms based on data availability
    const hasRatingData = userInteractionsData.length > 0;
    const hasWatchlist = watchlistFilms.length > 0;
    const hasWatchHistory = watchedFilmsData.length > 0;
    
    // Determine weights based on available data
    const mfWeight = hasRatingData ? 0.45 : 0.15;
    const cfWeight = hasWatchHistory ? 0.35 : 0.25;
    const cbWeight = hasWatchlist || hasWatchHistory ? 0.2 : 0.6;
    
    console.log(`Applied weights: MF=${mfWeight}, CF=${cfWeight}, CB=${cbWeight}`);
    
    // Create a weighted scoring system for films
    const filmScores = new Map<number, { id: number; score: number; title?: string }>();

    // Helper function to add film with weight
    const addFilmWithWeight = (film: { id: number; title?: string }, weight: number, sourceScore: number = 1.0) => {
      const existing = filmScores.get(film.id);
      if (existing) {
        existing.score += weight * sourceScore;
      } else {
        filmScores.set(film.id, { id: film.id, title: film.title, score: weight * sourceScore });
      }
    };
    
    // Add each source with appropriate weights
    matrixFactorFilms.forEach((film, index) => {
      // Decrease score as we go down the list (position bias)
      const positionScore = 1 - (index / matrixFactorFilms.length) * 0.5;
      addFilmWithWeight(film, mfWeight, positionScore);
    });
    
    collaborativeFilms.forEach((film, index) => {
      const positionScore = 1 - (index / collaborativeFilms.length) * 0.5;
      addFilmWithWeight(film, cfWeight, positionScore);
    });
    
    contentFilms.forEach((film, index) => {
      const positionScore = 1 - (index / contentFilms.length) * 0.5;
      addFilmWithWeight(film, cbWeight, positionScore);
    });
    
    // Special handling for watchlist items - give them a small boost
    watchlistFilms.forEach(film => {
      addFilmWithWeight(film, 0.1, 1.0);
    });
    
    // Convert to array and sort by score
    let recommendedFilms = Array.from(filmScores.values())
      .sort((a, b) => b.score - a.score);
    
    // Ensure we have enough recommendations
    if (recommendedFilms.length < 32) {
      try {
        const topRatedFilms = await getTopRatedFilms();
       
        const existingIds = new Set(recommendedFilms.map(f => f.id));
        const newTopRated = topRatedFilms.filter(f => !existingIds.has(f.id))
          .map((film, index) => ({
            id: film.id,
            title: film.title,
            score: 0.5 - (index / topRatedFilms.length) * 0.3 
          }));
        recommendedFilms = [...recommendedFilms, ...newTopRated].slice(0, 32);
      } catch (error) {
        console.error("❌ Error fetching top rated films:", error);
      }
    }

    // Limit to 32 recommendations
    recommendedFilms = recommendedFilms.slice(0, 32);

    // Create personalized category names
    let reason1 = "Films you might enjoy";
    let reason2 = "Popular recommendations";
    let reason3 = "Because you saved films to watch later";
    let reason4 = "Based on your watching history";

    // Personalize reasons based on user data
    if (userInteractionsData.length > 0) {
      const lastInteraction = userInteractionsData[0];
      if (lastInteraction.ratings >= 4) {
        reason1 = `Because you rated "${lastInteraction.title}" highly`;
      } else {
        reason1 = `Similar to "${lastInteraction.title}"`;
      }
    }

    if (watchedFilmsData.length > 0) {
      reason4 = `More like "${watchedFilmsData[0].title}"`;
    }

    // Log performance
    const endTime = Date.now();
    console.log(`✅ Hybrid recommendation completed in ${endTime - startTime}ms`);

    // Return recommendations grouped by reason
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
    console.log(`📊 Processing recommendation request for user: ${userId}`);
    
    // Attempt to get hybrid recommendations first (our most comprehensive approach)
    try {
      const recommendations = await hybridRecommendation(userId as string);
      console.log(`✅ Successfully generated hybrid recommendations for user: ${userId}`);
      return res.status(200).json(recommendations);
    } catch (hybridError) {
      console.error("❌ Hybrid recommendation failed:", hybridError);
    }
    
    // If hybrid fails, try matrix factorization
    try {
      const matrixFilms = await matrixFactorization(userId as string);
      if (matrixFilms.length > 0) {
        const films = await Promise.all(
          matrixFilms.map((film) => getFilmById(film.id))
        );
        console.log(`✅ Successfully generated matrix factorization recommendations for user: ${userId}`);
        return res.status(200).json([{
          reason: "Recommended for you",
          films: films.filter(Boolean).slice(0, 8)
        }]);
      }
    } catch (matrixError) {
      console.error("❌ Matrix factorization failed:", matrixError);
    }
    
    // If matrix factorization fails, try collaborative filtering
    try {
      const collaborativeFilms = await collaborativeFiltering(userId as string);
      if (collaborativeFilms.length > 0) {
        const films = await Promise.all(
          collaborativeFilms.map((film) => getFilmById(film.id))
        );
        console.log(`✅ Successfully generated collaborative filtering recommendations for user: ${userId}`);
        return res.status(200).json([{
          reason: "People who watched similar films also enjoyed",
          films: films.filter(Boolean).slice(0, 8)
        }]);
      }
    } catch (collabError) {
      console.error("❌ Collaborative filtering failed:", collabError);
    }

    // If collaborative fails, try content-based
    try {
      const contentFilms = await contentBasedFiltering(userId as string);
      if (contentFilms.length > 0) {
        console.log(`✅ Successfully generated content-based recommendations for user: ${userId}`);
        return res.status(200).json([{
          reason: "Based on your interests",
          films: contentFilms.slice(0, 8)
        }]);
      }
    } catch (contentError) {
      console.error("❌ Content-based filtering failed:", contentError);
    }

    // Fallback to top rated films if all else fails
    const topRated = await getTopRatedFilms();
    console.log(`ℹ️ Falling back to top rated films for user: ${userId}`);
    return res.status(200).json([{
      reason: "Popular films you might enjoy",
      films: topRated.slice(0, 8)
    }]);
  } catch (error) {
    console.error("❌ Error fetching recommendations:", error);
    return res.status(500).json({ error: "Failed to fetch recommendations" });
  }
}