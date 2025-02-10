import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle"; // Ensure correct import path for drizzle instance
import { film } from "@/app/db/schema"; // Import your schema for 'film'
import { eq, sql } from "drizzle-orm"; // Import necessary operators

// Define the film type based on your schema
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
  createdAt: string; // Expecting a string for createdAt
  rank: number;
};

// GET: Retrieve all films or filter by query parameters
export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title");
  const year = req.nextUrl.searchParams.get("year");
  const rating = req.nextUrl.searchParams.get("rating");

  try {
    const filters: any[] = [];

    // Add filters based on query parameters
    if (title) filters.push(sql`lower(${film.title}) like ${'%' + title.toLowerCase() + '%'}`);
    if (year) filters.push(eq(film.release, parseInt(year)));
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

    return NextResponse.json({ rows: filmsData }); // Return films as JSON
  } catch (error) {
    console.error("Error fetching films:", error);
    return NextResponse.json({ message: 'Error fetching films' }, { status: 500 });
  }
}

// POST: Retrieve a specific film by ID
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

    return NextResponse.json({ rows: filmData }); // Return the film as JSON
  } catch (error) {
    console.error("Error fetching film by ID:", error);
    return NextResponse.json({ message: 'Error fetching film by ID' }, { status: 500 });
  }
}
