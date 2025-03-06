import { db } from '@/app/db/drizzle';
import { film } from '@/app/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.toLowerCase().trim();
    const year = searchParams.get("year");
    const category = searchParams.get("category")?.toLowerCase().trim();

    if (!query && !year && !category) {
      return NextResponse.json({ message: "No search criteria provided", films: [] });
    }

    let films;

    if (year) {
      films = await db
        .select()
        .from(film)
        .where(sql`${film.releaseYear} = ${year}`)
        .limit(10)
        .execute();
    } else if (category) {
      films = await db
        .select({ id: film.id, title: film.title, year: film.releaseYear, category: film.category }) 
        .from(film)
        .where(sql`${film.category} ILIKE ${"%" + category + "%"}`)
        .limit(10)
        .execute();
    } else {
      const queryPattern = `%${query}%`;
      films = await db
        .select({ id: film.id, title: film.title, year: film.releaseYear, category: film.category })
        .from(film)
        .where(
          sql`${film.title} ILIKE ${queryPattern} OR ${film.category} ILIKE ${queryPattern}`
        )
        .limit(10)
        .execute();
    }

    return NextResponse.json({ films });
  } catch (error) {
    console.error("Error during search:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching films. Please try again later." },
      { status: 500 }
    );
  }
}

