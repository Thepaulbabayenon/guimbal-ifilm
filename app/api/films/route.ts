import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle"; // Assuming drizzle instance is exported from lib/drizzle
import { film } from "@/db/schema"; // Import your schema for 'film'
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
  youtubeString: string;
  createdAt: string; // Expecting a string for createdAt
  rank: number;
};

export const GET = async (req: NextRequest) => {
  try {
    // Get all films
    const filmsData = await db.select().from(film); // Assuming this returns the data correctly
    return NextResponse.json({ rows: filmsData }); // Wrap the data in `rows`
  } catch (error) {
    console.error("Error fetching films:", error);
    return NextResponse.error();
  }
};

// Handler to get films by specific query params
export const search = async (req: NextRequest) => {
  const title = req.nextUrl.searchParams.get("title");
  const year = req.nextUrl.searchParams.get("year");
  const rating = req.nextUrl.searchParams.get("rating");

  try {
    const filters: any = [];

    if (title) filters.push(sql`lower(${film.title}) like ${'%' + title.toLowerCase() + '%'}`);
    if (year) filters.push(eq(film.release, parseInt(year)));
    if (rating) filters.push(eq(film.rank, parseInt(rating)));

    // Query with dynamic filters
    const filmsData = await db
      .select()
      .from(film)
      .where(filters.length ? sql`${filters.join(' and ')}` : undefined);

    return NextResponse.json({ rows: filmsData }); // Wrap the result in `rows`
  } catch (error) {
    console.error("Error searching films:", error);
    return NextResponse.error();
  }
};

// Handler to get a specific film by ID
export const GET_film_BY_ID = async (req: NextRequest) => {
  const pathSegments = req.nextUrl.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1]; // Assuming URL format like '/films/1'

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: "Invalid or missing film ID" }, { status: 400 });
  }

  try {
    // Query film by ID
    const filmData = await db.select().from(film).where(eq(film.id, parseInt(id)));

    if (filmData.length === 0) {
      return NextResponse.json({ message: "film not found" }, { status: 404 });
    }

    return NextResponse.json({ rows: filmData }); // Wrap the result in `rows`
  } catch (error) {
    console.error("Error fetching film:", error);
    return NextResponse.error();
  }
};
