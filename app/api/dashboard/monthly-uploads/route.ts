// File: /app/api/dashboard/monthly-uploads/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { getUserFromSession, CookiesHandler } from '@/app/auth/core/session';
import { film } from '@/app/db/schema';
import { count, eq, and, gte, lte } from 'drizzle-orm'; 

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
    let startDate = new Date();
    let numberOfMonths = 6;
    
    if (timeRange === 'week') {
      startDate.setMonth(now.getMonth() - 3);
      numberOfMonths = 3;
    } else if (timeRange === 'month') {
      startDate.setMonth(now.getMonth() - 6);
      numberOfMonths = 6;
    } else if (timeRange === 'year') {
      startDate.setMonth(now.getMonth() - 12);
      numberOfMonths = 12;
    }

    // Prepare monthly buckets
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < numberOfMonths; i++) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth();
      
      months.unshift({
        month: `${monthNames[month]} ${year}`,
        year: year,
        monthIndex: month,
        startDate: new Date(year, month, 1),
        endDate: new Date(year, month + 1, 0, 23, 59, 59)
      });
    }
    

    const monthlyData = await Promise.all(months.map(async (monthData) => {
      const [{ count: films } = { count: 0 }] = await db
        .select({ count: count() }) 
        .from(film)
        .where(and(gte(film.createdAt, monthData.startDate), lte(film.createdAt, monthData.endDate))) 
        .execute(); 

      return {
        month: monthData.month,
        films
      };
    }));

    return NextResponse.json(monthlyData);
  } catch (error) {
    console.error('Error fetching monthly uploads:', error);
    return NextResponse.json({ error: 'Failed to fetch monthly uploads' }, { status: 500 });
  }
}
