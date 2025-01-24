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
    
    console.log("Extracted userId:", userId);

    if (!userId) {
        console.error("Missing userId in query parameters");
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        const userExists = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!userExists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.log("Fetching recommendations for userId:", userId);

        const recommendations = await hybridRecommendation(userId);

        console.log("Fetched recommendations:", recommendations);
        
        return NextResponse.json(recommendations);
    } catch (error) {
        console.error("Error fetching recommendations:", error);

        if (error instanceof Error) {
            console.error("Error stack:", error.stack);
        }

        // Handling NeonDbError or database issues
        return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
    }
}

