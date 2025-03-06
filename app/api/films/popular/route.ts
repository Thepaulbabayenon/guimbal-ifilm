import { NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle'; // Adjust the path if needed
import { film } from '@/app/db/schema'; // Adjust the path if needed
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const popularFilms = await db.select()
      .from(film)
      .orderBy(asc(film.rank)) 
      .limit(10); 

    return NextResponse.json({ success: true, films: popularFilms });
  } catch (error) {
    console.error('Error fetching popular films:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch popular films' }, { status: 500 });
  }
}
