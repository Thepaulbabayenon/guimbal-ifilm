import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { watchedFilms, film, users } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Validation schema with default value for watchedDuration
const watchedFilmsSchema = z.object({
  userId: z.string().min(1, "User ID is required."), // No UUID restriction, just a non-empty string
  filmId: z.preprocess((val) => Number(val), z.number().int()),
  watchedDuration: z.number().min(60, "Watched duration must be at least 60 seconds.").default(60), // Default to 60
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    console.log("🔍 Received request body:", body);

    const parsedBody = watchedFilmsSchema.parse(body);
    const { userId, filmId, watchedDuration } = parsedBody;

    console.log(`📌 Validated Input -> userId: ${userId}, filmId: ${filmId}, watchedDuration: ${watchedDuration}`);

    // Check if user exists
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userExists) {
      console.error("❌ User not found:", userId);
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check if film exists
    const filmExists = await db.query.film.findFirst({
      where: eq(film.id, filmId),
    });

    if (!filmExists) {
      console.error("❌ Film not found:", filmId);
      return NextResponse.json({ error: "Film not found." }, { status: 404 });
    }

    // Check if the film is already in the watchedFilms table
    const existingRecord = await db.query.watchedFilms.findFirst({
      where: and(eq(watchedFilms.userId, userId), eq(watchedFilms.filmId, filmId)),
    });

    if (!existingRecord) {
      // Insert new record into watchedFilms
      await db.insert(watchedFilms).values({
        userId,
        filmId,
        currentTimestamp: watchedDuration,
      });

      console.log("✅ Film successfully added to watched films:", { userId, filmId });
      return NextResponse.json({ message: "Film successfully added to watched films." }, { status: 201 });
    }

    // Update existing record
    await db
      .update(watchedFilms)
      .set({ currentTimestamp: watchedDuration })
      .where(and(eq(watchedFilms.userId, userId), eq(watchedFilms.filmId, filmId)));

    console.log("✅ Watched film updated successfully:", { userId, filmId });
    return NextResponse.json({ message: "Watched film updated successfully." });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Validation error:", error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("❌ Internal server error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
