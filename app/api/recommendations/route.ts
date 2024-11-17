import { NextResponse } from 'next/server';
import { hybridRecommendation } from '../getMovies';

export async function GET(req: Request) {
    console.log("Received request URL:", req.url);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    console.log("Extracted userId:", userId);

    if (!userId) {
        console.error("Missing userId in query parameters");
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        console.log("Fetching recommendations for userId:", userId);
        const recommendations = await hybridRecommendation(userId);

        console.log("Fetched recommendations:", recommendations);
        return NextResponse.json(recommendations);
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
    }
}
