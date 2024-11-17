import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle"; // Assuming drizzle instance is exported from lib/drizzle
import { movie } from "@/db/schema"; // Import your schema for movies
import { eq, sql } from 'drizzle-orm'; // Import operators from Drizzle for filtering

// Handler to get all movies
export const GET = async (req: NextRequest) => {
  try {
    // Get all movies
    const moviesData = await db.select().from(movie); // Changed 'movies' to 'movie'
    return NextResponse.json(moviesData);
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.error();
  }
};

// Handler to get movies by specific query params
export const search = async (req: NextRequest) => {
  // Accessing query parameters with .get()
  const title = req.nextUrl.searchParams.get("title");
  const year = req.nextUrl.searchParams.get("year");
  const rating = req.nextUrl.searchParams.get("rating");
  
  try {
    // Building dynamic filter for search
    const filters: any = [];

    if (title) filters.push(sql`lower(${movie.title}) like ${'%' + title.toLowerCase() + '%'}`);
    if (year) filters.push(eq(movie.release, parseInt(year)));
    if (rating) filters.push(eq(movie.rank, parseInt(rating)));

    // Query with dynamic filters
    const moviesData = await db
      .select()
      .from(movie)
      .where(filters.length ? sql`${filters.join(' and ')}` : undefined);

    return NextResponse.json(moviesData);
  } catch (error) {
    console.error("Error searching movies:", error);
    return NextResponse.error();
  }
};

// Handler to get a specific movie by ID
export const GET_MOVIE_BY_ID = async (req: NextRequest) => {
  // Extracting movie id from URL
  const pathSegments = req.nextUrl.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1]; // Assuming URL format like '/movies/1'

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: "Invalid or missing movie ID" }, { status: 400 });
  }

  try {
    // Query movie by ID
    const movieData = await db.select().from(movie).where(eq(movie.id, parseInt(id)));

    if (movieData.length === 0) {
      return NextResponse.json({ message: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json(movieData[0]);
  } catch (error) {
    console.error("Error fetching movie:", error);
    return NextResponse.error();
  }
};
