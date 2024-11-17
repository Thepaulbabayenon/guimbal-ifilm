import { NextResponse } from 'next/server';
import { hybridRecommendation } from '../getFilms';
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET request for recommendations
export async function GET(req: Request) {
    console.log("Received request URL:", req.url);

    // Extract userId from the query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    // Log the extracted userId for debugging
    console.log("Extracted userId:", userId);

    // Check if userId is provided; if not, return a 400 error
    if (!userId) {
        console.error("Missing userId in query parameters");
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        // Ensure user exists in the database
        const userExists = await db.query.users.findFirst({
            where: eq(users.id, userId), // Assuming 'id' is the column name
        });

        if (!userExists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Log the process of fetching recommendations
        console.log("Fetching recommendations for userId:", userId);
        
        // Fetch recommendations for the given userId
        const recommendations = await hybridRecommendation(userId);

        // Log the fetched recommendations for debugging
        console.log("Fetched recommendations:", recommendations);
        
        // Return the recommendations in the response
        return NextResponse.json(recommendations);
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
    }
}
