// app/api/recommendations/[userId]/route.ts
import { NextResponse } from 'next/server';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/app/db/drizzle';
import {
  userInteractions,
  watchLists,
  watchedFilms,
  film
} from '@/app/db/schema';

// Helper function to get film details by ID
async function getFilmById(id: number) {
  try {
    const filmData = await db
      .select()
      .from(film)
      .where(eq(film.id, id))
      .limit(1);
    
    return filmData[0] || null;
  } catch (error) {
    console.error("Error getting film by ID:", error);
    return null;
  }
}

// Get top rated films as a fallback
async function getTopRatedFilms() {
  try {
    return await db
      .select()
      .from(film)
      .orderBy(desc(film.averageRating), desc(film.rank))
      .limit(12);
  } catch (error) {
    console.error("Error getting top rated films:", error);
    return [];
  }
}

// Matrix factorization for collaborative filtering with latent factors
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

// Collaborative filtering based on user similarity
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
        and(
          sql`${userInteractions.userId} != ${userId}`,
          inArray(userInteractions.filmId, filmIds)
        )
      )
      .groupBy(userInteractions.userId)
      .orderBy(desc(sql`COUNT(DISTINCT ${userInteractions.filmId})`))  
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
        and(
          inArray(userInteractions.userId, similarUserIds),
          sql`NOT ${inArray(userInteractions.filmId, filmIds)}`
        )
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

// Content-based filtering using film metadata
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

// Hybrid recommendation system that combines all approaches
async function hybridRecommendation(userId: string) {
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

    // Fetch complete film details for recommendations
    const recommendationGroups = [];
    
    for (let i = 0; i < 4; i++) {
      const startIdx = i * 8;
      const endIdx = startIdx + 8;
      const groupFilms = recommendedFilms.slice(startIdx, endIdx);
      
      // Fetch complete film details for this group
      const detailedFilms = await Promise.all(
        groupFilms.map(async (film) => {
          const filmDetails = await getFilmById(film.id);
          return filmDetails || { id: film.id };
        })
      );
      
      recommendationGroups.push({
        reason: [reason1, reason2, reason3, reason4][i],
        films: detailedFilms.filter(Boolean)
      });
    }

    return recommendationGroups;
  } catch (error) {
    console.error("❌ Error in hybrid recommendation:", error);
    throw new Error("Failed to fetch hybrid recommendations");
  }
}

// App Router GET handler
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const userId = await params.userId;

  if (!userId) {
    return NextResponse.json({ error: "Valid user ID is required" }, { status: 400 });
  }

  try {
    console.log(`📊 Processing recommendation request for user: ${userId}`);
    
    // Attempt to get hybrid recommendations first (our most comprehensive approach)
    try {
      const recommendations = await hybridRecommendation(userId);
      console.log(`✅ Successfully generated hybrid recommendations for user: ${userId}`);
      return NextResponse.json(recommendations);
    } catch (hybridError) {
      console.error("❌ Hybrid recommendation failed:", hybridError);
    }
    
    // If hybrid fails, try matrix factorization
    try {
      const matrixFilms = await matrixFactorization(userId);
      if (matrixFilms.length > 0) {
        const films = await Promise.all(
          matrixFilms.map((film) => getFilmById(film.id))
        );
        console.log(`✅ Successfully generated matrix factorization recommendations for user: ${userId}`);
        return NextResponse.json([{
          reason: "Recommended for you",
          films: films.filter(Boolean).slice(0, 8)
        }]);
      }
    } catch (matrixError) {
      console.error("❌ Matrix factorization failed:", matrixError);
    }
    
    // If matrix factorization fails, try collaborative filtering
    try {
      const collaborativeFilms = await collaborativeFiltering(userId);
      if (collaborativeFilms.length > 0) {
        const films = await Promise.all(
          collaborativeFilms.map((film) => getFilmById(film.id))
        );
        console.log(`✅ Successfully generated collaborative filtering recommendations for user: ${userId}`);
        return NextResponse.json([{
          reason: "People who watched similar films also enjoyed",
          films: films.filter(Boolean).slice(0, 8)
        }]);
      }
    } catch (collabError) {
      console.error("❌ Collaborative filtering failed:", collabError);
    }

    // If collaborative fails, try content-based
    try {
      const contentFilms = await contentBasedFiltering(userId);
      if (contentFilms.length > 0) {
        console.log(`✅ Successfully generated content-based recommendations for user: ${userId}`);
        return NextResponse.json([{
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
    return NextResponse.json([{
      reason: "Popular films you might enjoy",
      films: topRated.slice(0, 8)
    }]);
  } catch (error) {
    console.error("❌ Error fetching recommendations:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}