import { db } from '@/db/drizzle';
import { film } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query')?.toLowerCase().trim();

    if (!query) {
      return NextResponse.json({ message: 'No query provided', films: [] });
    }

    const queryPattern = `%${query}%`;
    console.log("Query Parameter:", query); // Debug
    console.log("Query Pattern:", queryPattern); // Debug

    const films = await db
      .select()
      .from(film)
      .where(
        sql`(${film.title} ILIKE ${queryPattern} OR ${film.overview} ILIKE ${queryPattern})`
      )
      .limit(10)
      .execute();

    console.log("Query Results:", films); // Debug

    if (films.length === 0) {
      return NextResponse.json({ message: `No films found for query "${query}"`, films: [] });
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
