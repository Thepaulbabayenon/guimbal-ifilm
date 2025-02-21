import { NextResponse } from "next/server";
import { db } from "@/app/db/drizzle"; // Import your database instance
import { film } from "@/app/db/schema"; // Import the film table schema
import { eq } from "drizzle-orm";

// GET /api/films/:filmId - Fetch Film Details
export async function GET(_req: Request, { params }: { params: { filmId: string } }) {
  try {
    const filmId = parseInt(params.filmId);

    if (isNaN(filmId)) {
      return NextResponse.json({ error: "Invalid film ID" }, { status: 400 });
    }

    // Fetch film details from the database
    const filmData = await db.select().from(film).where(eq(film.id, filmId)).limit(1);

    if (!filmData.length) {
      return NextResponse.json({ error: "Film not found" }, { status: 404 });
    }

    return NextResponse.json({ film: filmData[0] });
  } catch (error) {
    console.error("Error fetching film details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
