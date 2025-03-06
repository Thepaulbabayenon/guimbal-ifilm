import { NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {

    const result = await db.execute(sql`
      SELECT * FROM ${film} ORDER BY RANDOM() LIMIT 1;
    `);

    // Ensure the result is properly accessed
    const randomFilm = result.rows?.[0];

    if (!randomFilm) {
      return NextResponse.json({ error: "No films available." }, { status: 404 });
    }

    return NextResponse.json(randomFilm);
  } catch (error) {
    console.error("Error fetching random film:", error);
    return NextResponse.json({ error: "Failed to fetch film" }, { status: 500 });
  }
}
