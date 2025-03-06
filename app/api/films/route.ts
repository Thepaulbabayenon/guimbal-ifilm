export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema"; 
import { eq, sql } from "drizzle-orm";


export type Film = {
  id: number;
  imageString: string;
  title: string;
  age: number;
  duration: number;
  overview: string;
  release: number;
  videoSource: string;
  category: string;
  trailer: string;
  createdAt: string;
  rank: number;
};

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title");
  const year = req.nextUrl.searchParams.get("year");
  const rating = req.nextUrl.searchParams.get("rating");

  try {
    const filters: any[] = [];

    // Add filters based on query parameters
    if (title) filters.push(sql`lower(${film.title}) like ${'%' + title.toLowerCase() + '%'}`);
    if (year) filters.push(eq(film.releaseYear, parseInt(year)));
    if (rating) filters.push(eq(film.rank, parseInt(rating)));

    // Query the database with filters if any are provided
    const query = db.select().from(film);
    if (filters.length > 0) {
      query.where(sql`${filters.join(' and ')}`);
    }

    const filmsData = await query;

    if (filmsData.length === 0) {
      return NextResponse.json({ message: "No films found" }, { status: 404 });
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
