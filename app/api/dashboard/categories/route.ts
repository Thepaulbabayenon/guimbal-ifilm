export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { film } from '@/app/db/schema';
import { CookiesHandler, getUserFromSession } from '@/app/auth/core/session';
import { SQL, count, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';
   
    const response = NextResponse.next();
    const cookiesHandler = new CookiesHandler(request, response);
    

    const session = await getUserFromSession(request.cookies.getAll().reduce((acc, cookie) => {
      acc[cookie.name] = cookie.value;
      return acc;
    }, {} as Record<string, string>));
    
 
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

  
    let whereCondition: SQL | undefined;
    if (timeRange !== 'all') {
      whereCondition = gte(film.createdAt, dateFilter);
    }

   
    const categoryGrouping = await db
      .select({
        category: film.category,
        count: count(film.id)
      })
      .from(film)
      .where(whereCondition)
      .groupBy(film.category);
    
    const categoryData = categoryGrouping.map(group => ({
      name: group.category,
      value: group.count
    }));

    return NextResponse.json(categoryData);
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    return NextResponse.json({ error: 'Failed to fetch category distribution' }, { status: 500 });
  }
}