import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle'; // Adjust the path if needed
import { movie } from '@/db/schema'; // Adjust the path if needed
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const popularMovies = await db.select()
      .from(movie)
      .orderBy(asc(movie.rank)) // Use the `asc` helper function for ordering
      .limit(10); // Limit to top 10 movies

    return NextResponse.json({ success: true, movies: popularMovies });
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch popular movies' }, { status: 500 });
  }
}
