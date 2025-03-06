// app/api/films/[filmId]/poster/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle'; 
import { eq } from 'drizzle-orm'; 
import { film } from '@/app/db/schema'; 

export async function GET(
  request: NextRequest,
  { params }: { params: { filmId: string } }
) {
  try {
    const filmId = parseInt(params.filmId, 10);

    if (isNaN(filmId)) {
      return NextResponse.json({ error: 'Invalid film ID' }, { status: 400 });
    }

    const filmData = await db
      .select({
        title: film.title,
        posterUrl: film.imageUrl, 
      })
      .from(film)
      .where(eq(film.id, filmId))
      .limit(1);

    const movie = filmData[0]; 

    if (!movie) {
      return NextResponse.json({ error: 'Film not found' }, { status: 404 });
    }

    return NextResponse.json({
      title: movie.title,
      posterUrl: movie.posterUrl,
    });

  } catch (error) {
    console.error('Error fetching film poster:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
