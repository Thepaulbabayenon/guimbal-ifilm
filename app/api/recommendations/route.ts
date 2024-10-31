// app/api/recommendations/route.ts
import { NextResponse } from 'next/server';
import { hybridRecommendation } from '../getMovies'; // Adjust the import path

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Ensure that userId is provided in the request
    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        const recommendations = await hybridRecommendation(userId);
        return NextResponse.json(recommendations);
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
    }
}
