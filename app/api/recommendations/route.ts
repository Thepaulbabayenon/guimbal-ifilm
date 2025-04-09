export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { hybridRecommendation } from '../getFilms';
import { db } from "@/app/db/drizzle";
import { users, film, userInteractions, watchLists, userRatings, watchedFilms } from "@/app/db/schema";
import { eq, desc, inArray, sql } from "drizzle-orm";
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function GET(req: Request) {
    console.log("📢 Received request:", req.url);

    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const useAI = searchParams.get('useAI') === 'true';

        console.log("🔍 Extracted userId:", userId);
        console.log("🧠 AI recommendations enabled:", useAI);

        if (!userId) {
            console.error("❌ Missing userId in query parameters");
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        console.log("🛠 Checking user existence in the database...");
        const userExists = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        console.log("✅ User exists:", !!userExists);

        if (!userExists) {
            console.error("❌ User not found in the database:", userId);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch base recommendations using existing method
        console.log("🎬 Fetching base recommendations for userId:", userId);
        let recommendations = await hybridRecommendation(userId);

        // Apply AI enhancements if enabled
        if (useAI && process.env.OPENAI_API_KEY) {
            console.log("🧠 Enhancing recommendations with AI...");
            recommendations = await enhanceRecommendationsWithAI(userId, recommendations);
        }

        if (!recommendations || recommendations.length === 0) {
            console.warn("⚠️ No recommendations found for user:", userId);
            return NextResponse.json([], { status: 200 });
        }

        console.log("✅ Fetched recommendations:", recommendations);
        return NextResponse.json(recommendations, { status: 200 });

    } catch (error) {
        console.error("❌ Error fetching recommendations:", error);

        if (error instanceof Error) {
            console.error("🛠 Error stack trace:", error.stack);
        }

        return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
    }
}

/**
 * Enhance recommendations using AI
 */
async function enhanceRecommendationsWithAI(userId: string, baseRecommendations: any[]) {
    try {
        // 1. Fetch user profile data
        const userProfile = await getUserProfile(userId);
        
        // 2. Get user's watched films with ratings
        const userWatchHistory = await getUserWatchHistory(userId);
        
        // 3. Get user's interaction patterns
        const userInteractionPatterns = await getUserInteractionPatterns(userId);
        
        // 4. Generate personalized recommendations with AI
        const aiEnhancedRecommendations = await generateAIRecommendations(
            userProfile,
            userWatchHistory,
            userInteractionPatterns,
            baseRecommendations
        );
        
        return aiEnhancedRecommendations;
    } catch (error) {
        console.error("❌ Error in AI recommendations:", error);
        // Fallback to base recommendations if AI fails
        return baseRecommendations;
    }
}

/**
 * Get user profile information
 */
async function getUserProfile(userId: string) {
    const userData = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId));
    
    return userData[0] || null;
}

/**
 * Get user's watch history with ratings
 */
async function getUserWatchHistory(userId: string) {
    // Get films the user has rated
    const userRatedFilms = await db
        .select({
            filmId: userRatings.filmId,
            rating: userRatings.rating,
            title: film.title,
            category: film.category,
            // Use createdAt instead of timestamp which doesn't exist
            createdAt: sql<Date>`CURRENT_TIMESTAMP`,
        })
        .from(userRatings)
        .leftJoin(film, eq(userRatings.filmId, film.id))
        .where(eq(userRatings.userId, userId))
        .orderBy(desc(sql<Date>`CURRENT_TIMESTAMP`)); // Order by current timestamp as fallback
    
    // Get films the user has watched
    const userWatchedFilms = await db
        .select({
            filmId: watchedFilms.filmId,
            title: film.title,
            category: film.category,
            currentTimestamp: watchedFilms.currentTimestamp,
            duration: film.duration,
            // Remove progress if it doesn't exist in the schema
        })
        .from(watchedFilms)
        .leftJoin(film, eq(watchedFilms.filmId, film.id))
        .where(eq(watchedFilms.userId, userId))
        .orderBy(desc(watchedFilms.currentTimestamp));
    
    return {
        ratedFilms: userRatedFilms,
        watchedFilms: userWatchedFilms,
    };
}

/**
 * Analyze user interaction patterns
 */
async function getUserInteractionPatterns(userId: string) {
    // Get most active times
    const interactionTimes = await db
        .select({
            hour: userInteractions.timestamp,
            // Don't use id if it doesn't exist in the schema
            count: sql<number>`count(*)`,
        })
        .from(userInteractions)
        .where(eq(userInteractions.userId, userId))
        .groupBy(userInteractions.timestamp);
    
    // Get most common categories
    const watchedCategories = await db
        .select({
            category: film.category,
        })
        .from(watchedFilms)
        .leftJoin(film, eq(watchedFilms.filmId, film.id))
        .where(eq(watchedFilms.userId, userId));
    
    const categoryCounts: Record<string, number> = {};
    watchedCategories.forEach(item => {
        const category = item.category || 'Unknown';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    return {
        interactionTimes,
        preferredCategories: categoryCounts,
    };
}

/**
 * Generate AI enhanced recommendations
 */
async function generateAIRecommendations(
    userProfile: any,
    watchHistory: any,
    interactionPatterns: any,
    baseRecommendations: any[]
) {
    // 1. Prepare data for AI processing
    const highlyRatedFilms = watchHistory.ratedFilms
        .filter((film: any) => film.rating >= 4)
        .map((film: any) => film.title);
    
    const recentlyWatchedFilms = watchHistory.watchedFilms
        .slice(0, 5)
        .map((film: any) => film.title);
    
   
    const sortedCategories = Object.entries(interactionPatterns.preferredCategories)
    .sort((a, b) => {
       
        const countA = Number(a[1]);
        const countB = Number(b[1]);
        return countB - countA;
    })
    .map(entry => entry[0]);
    
    // 2. Create context for AI
    const context = {
        highlyRatedFilms,
        recentlyWatchedFilms,
        preferredCategories: sortedCategories,
    };
    
    // 3. Generate personalized recommendation explanations using AI
    const enhancedRecommendations = [...baseRecommendations];
    
    for (let i = 0; i < enhancedRecommendations.length; i++) {
        const group = enhancedRecommendations[i];
        if (!group || !group.films || group.films.length === 0) continue;
        
        // Only process the first few recommendation groups to save API calls
        if (i <= 1) {
            try {
                const filmTitles = group.films.map((f: any) => f.title || '').filter(Boolean);
                
                // Skip AI processing if no film titles available
                if (filmTitles.length === 0) continue;
                
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a personalized film recommendation assistant. Generate a brief, specific reason why this collection of films would appeal to this user based on their preferences. Keep it to one sentence under 100 characters."
                        },
                        {
                            role: "user",
                            content: `User enjoys: ${context.preferredCategories.join(', ')}. 
                            They highly rated: ${context.highlyRatedFilms.join(', ')}. 
                            Recently watched: ${context.recentlyWatchedFilms.join(', ')}.
                            The film collection to explain is: ${filmTitles.join(', ')}.
                            Current explanation is: "${group.reason}"`
                        }
                    ]
                });
                
                // Update the recommendation reason with AI-generated explanation
                if (completion.choices[0]?.message?.content) {
                    group.reason = completion.choices[0].message.content.replace(/^["']|["']$/g, '');
                    
                    // Add AI badge to signify enhanced recommendation
                    group.isAIEnhanced = true;
                }
            } catch (error) {
                console.error("❌ Error generating AI explanation:", error);
                // Keep original reason if AI fails
            }
        }
    }
    
    // 4. Add an AI-specific recommendation category if possible
    try {
        const topCategories = sortedCategories.slice(0, 3).join(', ');
        const filmsData = await db
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
            .where(inArray(film.category, sortedCategories.slice(0, 3)))
            .orderBy(desc(film.averageRating))
            .limit(8);
        
        // Get film IDs the user has already watched
        const watchedFilmIds = watchHistory.watchedFilms.map((f: any) => f.filmId);
        
        // Filter out films the user has already watched
        const newRecommendations = filmsData.filter((f: any) => !watchedFilmIds.includes(f.id));
        
        if (newRecommendations.length >= 4) {
            enhancedRecommendations.push({
                reason: `AI-curated selection based on your preference for ${topCategories}`,
                films: newRecommendations.slice(0, 8),
                isAIEnhanced: true
            });
        }
    } catch (error) {
        console.error("❌ Error generating AI category:", error);
    }
    
    return enhancedRecommendations;
}