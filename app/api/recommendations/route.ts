export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { hybridRecommendation } from '../getFilms';
import { db } from "@/app/db/drizzle";
import { users, film, watchLists, userRatings, watchedFilms } from "@/app/db/schema";
import { eq, desc, inArray, sql, and, gt } from "drizzle-orm";
import OpenAI from 'openai';
import NodeCache from "node-cache";
import pLimit from 'p-limit';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 30000
});

// Create a multi-layered cache system with different TTLs
const recommendationsCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // 1 hour for recommendations
const userProfileCache = new NodeCache({ stdTTL: 7200, checkperiod: 1200 }); // 2 hours for user profiles
const aiExplanationsCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 }); // 24 hours for AI explanations

// Concurrency limiter for OpenAI API calls
const aiLimit = pLimit(5); // Max 5 concurrent OpenAI API calls

export async function GET(req: Request) {
  console.log("📢 Received request:", req.url);
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const useAI = searchParams.get('useAI') === 'true';
    const forceRefresh = searchParams.get('refresh') === 'true';

    console.log("🔍 Request parameters:", { userId, useAI, forceRefresh });

    if (!userId) {
      console.error("❌ Missing userId in query parameters");
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Create cache keys
    const recommendationsCacheKey = `recommendations:${userId}:${useAI}`;
    
    // Try to get recommendations from cache unless force refresh is requested
    let recommendations = forceRefresh ? undefined : recommendationsCache.get<any>(recommendationsCacheKey);

    if (recommendations === undefined) {
      console.log("🛠 Cache miss or refresh requested - generating new recommendations");
      
      // Check user existence
      const userExists = await getUserIfExists(userId);
      if (!userExists) {
        console.error("❌ User not found in the database:", userId);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Fetch base recommendations
      console.log("🎬 Fetching base recommendations for userId:", userId);
      recommendations = await hybridRecommendation(userId);

      // Apply AI enhancements if enabled
      if (useAI && process.env.OPENAI_API_KEY) {
        console.log("🧠 Enhancing recommendations with AI...");
        recommendations = await enhanceRecommendationsWithAI(userId, recommendations);
        
        // Track AI usage for monitoring
        incrementAIUsageMetric(userId);
      }

      if (!recommendations || recommendations.length === 0) {
        console.warn("⚠️ No recommendations found for user:", userId);
        return NextResponse.json([], { status: 200 });
      }

      // Store in cache
      recommendationsCache.set(recommendationsCacheKey, recommendations);
    } else {
      console.log("✅ Recommendations retrieved from cache");
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Request completed in ${processingTime}ms`);
    
    return NextResponse.json(
      {
        recommendations,
        meta: {
          cached: recommendations !== undefined,
          processingTime,
          aiEnhanced: useAI && process.env.OPENAI_API_KEY !== undefined
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Error fetching recommendations:", error);

    if (error instanceof Error) {
      console.error("🛠 Error stack trace:", error.stack);
    }

    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}

/**
 * Get user if exists (with caching)
 */
async function getUserIfExists(userId: string) {
  const cacheKey = `user:${userId}`;
  let user = userProfileCache.get<any>(cacheKey);
  
  if (user === undefined) {
    user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    if (user) {
      userProfileCache.set(cacheKey, user);
    }
  }
  
  return user;
}

/**
 * Enhance recommendations using AI with optimized processing
 */
async function enhanceRecommendationsWithAI(userId: string, baseRecommendations: any[]) {
  try {
    // Get user data from a comprehensive consolidated query
    const userData = await getUserComprehensiveData(userId);
    
    if (!userData) {
      console.warn("⚠️ No user data found for AI recommendations");
      return baseRecommendations;
    }
    
    // Extract the context for AI processing
    const context = prepareAIContext(userData);
    
    // Process recommendations in parallel with rate limiting
    const enhancedRecommendations = [...baseRecommendations];
    
    // Process only first two recommendation groups (to save API calls)
    const processingPromises = enhancedRecommendations
      .slice(0, 2)
      .map((group, index) => 
        processRecommendationGroup(group, context, index)
      );
    
    await Promise.all(processingPromises);
    
    // Add an AI-specific category if possible
    const aiCategory = await createAISpecificCategory(userData, context);
    if (aiCategory) {
      enhancedRecommendations.push(aiCategory);
    }
    
    return enhancedRecommendations;
  } catch (error) {
    console.error("❌ Error in AI recommendations:", error);
    // Fallback to base recommendations if AI fails
    return baseRecommendations;
  }
}

/**
 * Get comprehensive user data in a single optimized query
 */
async function getUserComprehensiveData(userId: string) {
  const cacheKey = `userData:${userId}`;
  let userData = userProfileCache.get<any>(cacheKey);
  
  if (userData === undefined) {
    try {
      // Get user profile
      const userProfile = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId));
      
      if (!userProfile || userProfile.length === 0) {
        return null;
      }
      
      // Get user's watch history with ratings in a single query with joins
      const watchHistory = await db
        .select({
          filmId: film.id,
          title: film.title,
          category: film.category,
          releaseYear: film.releaseYear,
          imageUrl: film.imageUrl,
          overview: film.overview,
          averageRating: film.averageRating,
          userRating: userRatings.rating,
          watched: sql<boolean>`CASE WHEN ${watchedFilms.filmId} IS NOT NULL THEN TRUE ELSE FALSE END`,
          watchTimestamp: watchedFilms.currentTimestamp,
        })
        .from(film)
        .leftJoin(
          userRatings, 
          and(
            eq(userRatings.filmId, film.id),
            eq(userRatings.userId, userId)
          )
        )
        .leftJoin(
          watchedFilms,
          and(
            eq(watchedFilms.filmId, film.id),
            eq(watchedFilms.userId, userId)
          )
        )
        .where(
          sql`${userRatings.userId} = ${userId} OR ${watchedFilms.userId} = ${userId}`
        );
      
      // Get films in user's watchlist
      const watchlist = await db
        .select({
          filmId: watchLists.filmId,
          title: film.title,
          category: film.category,
          addedAt: watchLists.addedAt
        })
        .from(watchLists)
        .leftJoin(film, eq(film.id, watchLists.filmId))
        .where(eq(watchLists.userId, userId))
        .orderBy(desc(watchLists.addedAt));
      
      userData = {
        profile: userProfile[0],
        watchHistory,
        watchlist
      };
      
      userProfileCache.set(cacheKey, userData, 1800); // Cache for 30 minutes
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      return null;
    }
  }
  
  return userData;
}

/**
 * Prepare context for AI processing
 */
function prepareAIContext(userData: any) {
  // Extract and process watched films
  const watchedFilms = userData.watchHistory
    .filter((item: any) => item.watched)
    .sort((a: any, b: any) => 
      new Date(b.watchTimestamp || 0).getTime() - new Date(a.watchTimestamp || 0).getTime()
    );
  
  // Extract and process rated films
  const ratedFilms = userData.watchHistory
    .filter((item: any) => item.userRating !== null && item.userRating !== undefined)
    .sort((a: any, b: any) => b.userRating - a.userRating);
  
  // Extract watchlist films
  const watchlistFilms = userData.watchlist || [];
  
  // Calculate category preferences
  const categoryCounter: Record<string, number> = {};
  
  // Add weights from watched films
  watchedFilms.forEach((item: any) => {
    if (item.category) {
      const category = item.category;
      categoryCounter[category] = (categoryCounter[category] || 0) + 1;
    }
  });
  
  // Add extra weight from rated films
  ratedFilms.forEach((item: any) => {
    if (item.category && item.userRating) {
      const category = item.category;
      // Give extra weight based on rating (1-5)
      categoryCounter[category] = (categoryCounter[category] || 0) + item.userRating;
    }
  });
  
  // Add weight from watchlist items
  watchlistFilms.forEach((item: any) => {
    if (item.category) {
      const category = item.category;
      categoryCounter[category] = (categoryCounter[category] || 0) + 2; // Give watchlist items significant weight
    }
  });
  
  // Sort categories by count
  const sortedCategories = Object.entries(categoryCounter)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(entry => entry[0]);
  
  return {
    recentlyWatchedFilms: watchedFilms.slice(0, 5).map((f: any) => f.title),
    highlyRatedFilms: ratedFilms.filter((f: any) => f.userRating >= 4).map((f: any) => f.title),
    watchlistFilms: watchlistFilms.slice(0, 5).map((f: any) => f.title),
    preferredCategories: sortedCategories,
    watchedFilmIds: watchedFilms.map((f: any) => f.filmId),
    userData // Include raw data for advanced processing
  };
}

/**
 * Process a recommendation group with AI enhancement
 */
async function processRecommendationGroup(group: any, context: any, groupIndex: number) {
  if (!group || !group.films || group.films.length === 0) return group;
  
  const filmTitles = group.films.map((f: any) => f.title || '').filter(Boolean);
  if (filmTitles.length === 0) return group;
  
  // Create a unique cache key for this explanation
  const explanationKey = `ai:explanation:${filmTitles.sort().join(',')}-${(context.preferredCategories || []).slice(0, 3).join(',')}`;
  
  // Check if we already have this explanation cached
  let aiExplanation = aiExplanationsCache.get<string>(explanationKey);
  
  if (aiExplanation === undefined) {
    try {
      // Process with concurrency limiting
      aiExplanation = await aiLimit(async () => {
        // Calculate film categories in this group
        const groupCategories: Record<string, number> = {};
        group.films.forEach((f: any) => {
          if (f.category) {
            groupCategories[f.category] = (groupCategories[f.category] || 0) + 1;
          }
        });
        
        const dominantCategories = Object.entries(groupCategories)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 2)
          .map(entry => entry[0]);
        
        // Ensure we have data to work with
        const preferredCategories = context.preferredCategories || [];
        const highlyRatedFilms = context.highlyRatedFilms || [];
        const recentlyWatchedFilms = context.recentlyWatchedFilms || [];
        const watchlistFilms = context.watchlistFilms || [];
        
        // Craft a more specific prompt based on the film categories
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a personalized film recommendation assistant. Generate a brief, specific reason why this collection of films would appeal to this user based on their preferences. Keep it to one sentence under 100 characters."
            },
            {
              role: "user",
              content: `User enjoys: ${preferredCategories.slice(0, 3).join(', ')}. 
                They highly rated: ${highlyRatedFilms.slice(0, 3).join(', ')}. 
                Recently watched: ${recentlyWatchedFilms.slice(0, 3).join(', ')}.
                On their watchlist: ${watchlistFilms.slice(0, 3).join(', ')}.
                This film collection is primarily ${dominantCategories.join(' and ')} and includes: ${filmTitles.slice(0, 4).join(', ')}.
                Current explanation is: "${group.reason}"`
            }
          ],
          temperature: 0.7,
          max_tokens: 100
        });
        
        const content = completion.choices[0]?.message?.content;
        if (content) {
          // Clean up the explanation
          return content.replace(/^["']|["']$/g, '');
        }
        return undefined;
      });
      
      // Cache the AI explanation for future use
      if (aiExplanation) {
        aiExplanationsCache.set(explanationKey, aiExplanation);
      }
    } catch (error) {
      console.error(`❌ Error generating AI explanation for group ${groupIndex}:`, error);
      // Keep original reason if AI fails
      return group;
    }
  }
  
  // Update the group with AI explanation if we have one
  if (aiExplanation) {
    group.reason = aiExplanation;
    group.isAIEnhanced = true;
  }
  
  return group;
}

/**
 * Create an AI-specific recommendation category
 */
async function createAISpecificCategory(userData: any, context: any) {
    // Ensure we have valid data to work with
    const preferredCategories = context.preferredCategories || [];
    const watchedFilmIds = context.watchedFilmIds || [];
    
    // Create cache key using safe values
    const cacheKey = `ai:category:${preferredCategories.slice(0, 3).join(',')}:${watchedFilmIds.length}`;
    let aiCategory = recommendationsCache.get<any>(cacheKey);
    
    if (aiCategory === undefined) {
      try {
        // Get top categories
        const topCategories = preferredCategories.slice(0, 3);
        
        if (topCategories.length === 0) {
          return null;
        }
        
        // Find films in preferred categories that user hasn't watched
        const safeCategoriesFilter = topCategories.length > 0 
          ? inArray(film.category, topCategories)
          : sql`1=1`; // Fallback if no categories
        
        const safeWatchedFilter = watchedFilmIds.length > 0 
          ? sql`${film.id} NOT IN (${watchedFilmIds.join(',')})` 
          : sql`1=1`; // Fallback if no watched films
        
        const newRecommendations = await db
          .select({
            id: film.id,
            title: film.title,
            imageUrl: film.imageUrl,
            overview: film.overview,
            category: film.category,
            releaseYear: film.releaseYear,
            averageRating: film.averageRating,
          })
          .from(film)
          .where(
            and(
              safeCategoriesFilter,
              gt(film.averageRating, 3.5),
              safeWatchedFilter
            )
          )
          .orderBy(desc(film.averageRating))
          .limit(12);
        
        // Only create a category if we have enough films
        if (newRecommendations.length >= 4) {
          // Generate an explanation for this category
          let explanation;
          try {
            const completion = await aiLimit(async () => {
              // Safely access high-rated films
              const highlyRatedFilms = context.highlyRatedFilms || [];
              const watchlistFilms = context.watchlistFilms || [];
              
              return await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                  {
                    role: "system",
                    content: "Create a personalized, enthusiastic one-sentence recommendation under 80 characters."
                  },
                  {
                    role: "user",
                    content: `Create a personalized recommendation for a user who enjoys ${topCategories.join(', ')} films. 
                      Some films they've rated highly include: ${highlyRatedFilms.slice(0, 3).join(', ')}.
                      Films on their watchlist include: ${watchlistFilms.slice(0, 3).join(', ')}.
                      The recommendation should explain why they might enjoy a collection of ${topCategories[0]} and ${topCategories[1] || topCategories[0]} films.`
                  }
                ],
                temperature: 0.8,
                max_tokens: 80
              });
            });
            
            explanation = completion.choices[0]?.message?.content?.replace(/^["']|["']$/g, '') || 
              `AI-curated selection based on your preference for ${topCategories.join(', ')}`;
          } catch (error) {
            explanation = `Specially selected ${topCategories[0]} films just for you`;
          }
          
          aiCategory = {
            reason: explanation,
            films: newRecommendations.slice(0, 8),
            isAIEnhanced: true,
            isCustomCategory: true
          };
          
          // Cache this category
          recommendationsCache.set(cacheKey, aiCategory, 7200); // 2 hours
        }
      } catch (error) {
        console.error("❌ Error generating AI category:", error);
        return null;
      }
    }
    
    return aiCategory;
  }

/**
 * Increment AI usage metric for monitoring
 */
function incrementAIUsageMetric(userId: string) {
  try {
    // This would connect to your metrics system
    console.log(`📊 AI recommendation used for user: ${userId} at ${new Date().toISOString()}`);
  } catch (error) {
    // Don't let metrics failures impact the main functionality
    console.error("❌ Error tracking metrics:", error);
  }
}