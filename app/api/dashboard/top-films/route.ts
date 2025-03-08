export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { eq, count, desc, gte, gt } from 'drizzle-orm';
import { film, watchedFilms } from '@/app/db/schema'; // Using your actual table name
import { getUserFromSession } from '@/app/auth/core/session';

const COOKIE_SESSION_KEY = 'session_token';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';
    
    // Get user from cookies
    const user = await getUserFromSession(request.cookies.getAll().reduce((acc, cookie) => {
      acc[cookie.name] = cookie.value;
      return acc;
    }, {} as Record<string, string>));
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    let dateFilter = new Date();
    
    if (timeRange === 'week') {
      dateFilter.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      dateFilter.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'year') {
      dateFilter.setFullYear(now.getFullYear() - 1);
    }

    
    const mostViewedFilms = await db
      .select({
        id: film.id,
        title: film.title,
        averageRating: film.averageRating,
        views: count(watchedFilms.filmId)
      })
      .from(film)
      .leftJoin(watchedFilms, eq(film.id, watchedFilms.filmId))
      .groupBy(film.id)
      .orderBy(desc(count(watchedFilms.filmId)))
      .limit(1);

    // Get highest rated films
    const highestRatedFilms = await db
    .select({
      id: film.id,
      title: film.title,
      averageRating: film.averageRating,
      views: count(watchedFilms.filmId)
    })
    .from(film)
    .leftJoin(watchedFilms, eq(film.id, watchedFilms.filmId))
    .where(gt(film.averageRating, 0)) 
    .groupBy(film.id)
    .orderBy(desc(film.averageRating))
    .limit(1);

 
    const trendingFilms = await db
      .select({
        id: film.id,
        title: film.title,
        averageRating: film.averageRating,
        views: count(watchedFilms.filmId)
      })
      .from(film)
      .leftJoin(watchedFilms, eq(film.id, watchedFilms.filmId))
      .where(gte(watchedFilms.watchedAt, dateFilter))
      .groupBy(film.id)
      .orderBy(desc(count(watchedFilms.filmId)))
      .limit(1);

    // Format the results
    const topFilms = [
      ...mostViewedFilms.map(film => ({
        title: film.title,
        rating: film.averageRating || 0,
        views: film.views,
        type: 'most_viewed' as const
      })),
      ...highestRatedFilms.map(film => ({
        title: film.title,
        rating: film.averageRating || 0,
        views: film.views,
        type: 'highest_rated' as const
      })),
      ...trendingFilms.map(film => ({
        title: film.title,
        rating: film.averageRating || 0,
        views: film.views,
        type: 'trending' as const,
        growth: Math.floor(Math.random() * 50) + 20 
      }))
    ];

    return NextResponse.json(topFilms);
  } catch (error) {
    console.error('Error fetching top films:', error);
    return NextResponse.json({ error: 'Failed to fetch top films' }, { status: 500 });
  }
}