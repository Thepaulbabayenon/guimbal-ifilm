import { db } from '@/db/drizzle'; // Database instance
import { film } from '@/db/schema'; // Schema definition
import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm'; // SQL helper

// Force this route to be dynamic
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url); // Extract query parameters
    const query = searchParams.get('query')?.toLowerCase().trim(); // Sanitize and normalize query

    // Return an empty list if no query is provided
    if (!query) {
      return NextResponse.json({ message: 'No query provided', films: [] });
    }

    // Use parameterized SQL query for better security
    const queryPattern = `%${query}%`;
    const films = await db
      .select()
      .from(film)
      .where(
        sql`(${film.title} ILIKE ${queryPattern} OR ${film.overview} ILIKE ${queryPattern})`
      )
      .limit(10)
      .execute();

    // Return films or a message if no results are found
    if (films.length === 0) {
      return NextResponse.json({ message: 'No films found', films: [] });
    }

    return NextResponse.json({ films });
  } catch (error) {
    console.error('Error during search:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching films. Please try again later.' },
      { status: 500 }
    );
  }
}
