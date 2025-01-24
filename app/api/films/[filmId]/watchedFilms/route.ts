import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db/drizzle"; // Adjust the path to your Drizzle database instance
import { watchedFilms, film, users } from "@/db/schema"; // Adjust schema imports as necessary
import { eq, and } from "drizzle-orm"; // Import comparison helpers
import { z } from "zod"; // Zod for validation

// Validation schema for the request body
const watchedFilmsSchema = z.object({
  userId: z.string().uuid(),
  filmId: z.number().int(),
  watchedDuration: z.number().min(60, "Watched duration must be at least 60 seconds."),
});

// Define POST method explicitly
export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Parse and validate the request body
    const body = watchedFilmsSchema.parse(req.body);

    const { userId, filmId, watchedDuration } = body;

    // Fetch user and film in parallel to optimize DB queries
    const [userExists, filmExists] = await Promise.all([
      db.query.users.findFirst({ where: eq(users.id, userId) }),
      db.query.film.findFirst({ where: eq(film.id, filmId) }),
    ]);

    if (!userExists) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!filmExists) {
      return res.status(404).json({ error: "Film not found." });
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

      return res.status(201).json({ message: "Film successfully added to watched films." });
    }

    // Update the currentTimestamp if a record already exists
    await db
      .update(watchedFilms)
      .set({ currentTimestamp: watchedDuration })
      .where(and(eq(watchedFilms.userId, userId), eq(watchedFilms.filmId, filmId)));

    return res.status(200).json({ message: "Watched film updated successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      return res.status(400).json({ error: error.errors });
    }

    console.error("Error handling watched film:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
