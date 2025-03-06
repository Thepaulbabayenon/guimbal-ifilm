import { NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { userPreferences } from "@/app/db/schema";
import { eq } from "drizzle-orm"; 

export async function POST(req: Request) {
  try {
    const { userId, preferences } = await req.json();

    if (!userId || !preferences) {
      return NextResponse.json({ error: "Missing userId or preferences" }, { status: 400 });
    }

    await db.insert(userPreferences).values({
      userId, 
      favoriteGenres: preferences.genres.join(","),
      preferredMoods: preferences.moods.join(","),
      themes: preferences.themes.join(","),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }


    const userPrefs = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    return NextResponse.json(userPrefs);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
