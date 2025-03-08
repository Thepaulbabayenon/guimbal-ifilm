// File: /app/api/dashboard/rating-distribution/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { getUserFromSession, CookiesHandler } from '@/app/auth/core/session';
import { userRatings } from '@/app/db/schema';
import { count, eq, gte, and } from 'drizzle-orm'; 

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';
    
   
    const response = NextResponse.next();
    const cookiesHandler = new CookiesHandler(request, response);

   
    const session = await getUserFromSession(
      Object.fromEntries(request.cookies.getAll().map(cookie => [cookie.name, cookie.value]))
    );

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


    const ratings = [1, 2, 3, 4, 5];
    const distributionData = await Promise.all(ratings.map(async (ratingValue) => {
      const [{ count: ratingCount } = { count: 0 }] = await db
        .select({ count: count() })
        .from(userRatings)
        .where(and(eq(userRatings.rating, ratingValue), gte(userRatings.createdAt, dateFilter))) 
        .execute(); 

      return {
        rating: ratingValue.toString(),
        count: ratingCount
      };
    }));

    return NextResponse.json(distributionData);
  } catch (error) {
    console.error('Error fetching rating distribution:', error);
    return NextResponse.json({ error: 'Failed to fetch rating distribution' }, { status: 500 });
  }
}
