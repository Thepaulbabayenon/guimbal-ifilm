import { NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { userPreferences } from "@/app/db/schema";
import { eq } from "drizzle-orm"; // ✅ Import `eq`

export async function POST(req: Request) {
  const { userId, preferences } = await req.json();
  
  await db.insert(userPreferences).values({
    userId,
    favoriteGenres: preferences.genres.join(","), 
    preferredMoods: preferences.moods.join(","), 
    themes: preferences.themes.join(","), 
  });

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const { userId } = await req.json();


  const userPrefs = await db.select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId)); 

  return NextResponse.json(userPrefs);
}
