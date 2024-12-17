import { db } from '@/db/drizzle'; // Your db instance import
import { film } from '@/db/schema'; // Your schema import
import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm'; // Import the sql expression helper

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url); // Get search parameters
    const query = searchParams.get('query')?.toLowerCase().trim() || ''; // Handle empty or missing query

    if (!query) {
      return NextResponse.json([]); // Return empty list if no query provided
    }

    // Construct the SQL query with an OR condition using ILIKE
    const films = await db
      .select()
      .from(film)
      .where(
        sql`(${film.title} ILIKE ${'%' + query + '%'} OR ${film.overview} ILIKE ${'%' + query + '%'})`
      )
      .limit(10)
      .execute();

    return NextResponse.json(films); // Return the films found
  } catch (error) {
    console.error('Error during search:', error); // Log error for debugging
    return NextResponse.json({ error: 'Failed to fetch films' }, { status: 500 });
  }
}
