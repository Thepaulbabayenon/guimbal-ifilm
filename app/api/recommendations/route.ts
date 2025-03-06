export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { hybridRecommendation } from '../getFilms';
import { db } from "@/app/db/drizzle";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
    console.log("📢 Received request:", req.url);

    try {
      
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        console.log("🔍 Extracted userId:", userId);

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

        // Fetch recommendations
        console.log("🎬 Fetching recommendations for userId:", userId);
        const recommendations = await hybridRecommendation(userId);

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
