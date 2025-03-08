export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { film, userRatings } from '@/app/db/schema'; 
import {  gte, count, avg } from 'drizzle-orm'; 
import { getUserFromSession } from '@/app/auth/core/session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';
    
  
    const cookies = Object.fromEntries(
      request.cookies.getAll().map(cookie => [cookie.name, cookie.value])
    );
    
    const session = await getUserFromSession(cookies);
    
   
    if (!session || session.role !== 'admin') {
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


    const [totalFilmsResult] = await db.select({ count: count() }).from(film);
    const totalFilms = totalFilmsResult.count;
    
  
    const [uploadedFilmsResult] = await db
      .select({ count: count() })
      .from(film)
      .where(gte(film.createdAt, dateFilter));
    const uploadedFilms = uploadedFilmsResult.count;
    

    const [averageRatingResult] = await db
      .select({ average: avg(userRatings.rating) }) 
      .from(userRatings);
    const averageRating = averageRatingResult.average || 0;

    return NextResponse.json({
      total: totalFilms,
      uploadedThisMonth: uploadedFilms,
      averageRating: averageRating
    });
  } catch (error) {
    console.error('Error fetching film statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch film statistics' }, { status: 500 });
  }
}
