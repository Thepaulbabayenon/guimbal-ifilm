// app/api/movies/recommendations/route.ts
import { NextResponse } from 'next/server';
import { hybridRecommendation } from '../getMovies'; // Import your recommendation logic

// Handle GET requests
export async function GET(req: Request) {
    // Parse the URL to get query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); // Extract 'userId' from the query string

    // If 'userId' is missing, return a 400 response
    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        // Call your recommendation function with the userId
        const recommendations = await hybridRecommendation(userId);
        
        // Return recommendations as JSON
        return NextResponse.json(recommendations);
    } catch (error) {
        console.error("Error fetching recommendations:", error);

        // Return error if the recommendation function fails
        return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
    }
}
