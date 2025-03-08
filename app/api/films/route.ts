export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema"; 
import { eq, sql, and, desc } from "drizzle-orm";

export type Film = {
  id: number;
  imageUrl: string;
  title: string;
  ageRating: number;
  duration: number;
  overview: string;
  releaseYear: number;
  videoSource: string;
  category: string;
  trailerUrl: string;
  createdAt: string;
  updatedAt: string;
  producer: string;
  director: string;
  coDirector: string;
  studio: string;
  rank: number;
  averageRating: number | null;
};

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title");
  const year = req.nextUrl.searchParams.get("year");
  const rating = req.nextUrl.searchParams.get("rating");
  const category = req.nextUrl.searchParams.get("category");
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : 10;

  try {
    const baseQuery = db.select().from(film);
    
    // Build conditions array
    const conditions = [];
    if (title) conditions.push(sql`lower(${film.title}) like ${'%' + title.toLowerCase() + '%'}`);
    if (year) conditions.push(eq(film.releaseYear, parseInt(year)));
    if (rating) conditions.push(eq(film.rank, parseInt(rating)));
    if (category) conditions.push(eq(film.category, category));
    
    // Execute query with conditions and limit
    let filmsData;
    
    if (conditions.length > 0) {
      // With conditions
      filmsData = await baseQuery
        .where(and(...conditions))
        .orderBy(desc(film.rank))
        .limit(limit);
    } else {
      // No conditions
      filmsData = await baseQuery
        .orderBy(desc(film.rank))
        .limit(limit);
    }

    // Return data in the format expected by the component
    if (filmsData.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json({ rows: filmsData });
  } catch (error) {
    console.error("Error fetching films:", error);
    return NextResponse.json({ message: 'Error fetching films' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body to extract the film ID
    const { id } = await req.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: "Invalid or missing film ID" }, { status: 400 });
    }

    // Query the film by ID
    const filmData = await db.select().from(film).where(eq(film.id, parseInt(id)));

    if (filmData.length === 0) {
      return NextResponse.json({ message: "Film not found" }, { status: 404 });
    }

    return NextResponse.json({ rows: filmData });
  } catch (error) {
    console.error("Error fetching film by ID:", error);
    return NextResponse.json({ message: 'Error fetching film by ID' }, { status: 500 });
  }
}