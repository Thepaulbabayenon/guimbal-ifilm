// File: /app/api/dashboard/recent-activity/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { getUserFromSession, CookiesHandler } from '@/app/auth/core/session';
import { film, userRatings, users } from '@/app/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '4', 10);

  
    const response = NextResponse.next();
    const cookiesHandler = new CookiesHandler(request, response);

   
    const session = await getUserFromSession(
      Object.fromEntries(request.cookies.getAll().map(cookie => [cookie.name, cookie.value]))
    );

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    const recentUploads = await db
  .select({
    title: film.title,
    createdAt: film.createdAt,
    userName: users.name,
  })
  .from(film)
  .leftJoin(users, eq(film.uploadedBy, users.id)) 
  .orderBy(desc(film.createdAt))
  .limit(limit)
  .execute();


   
    const recentRatings = await db
      .select({
        createdAt: userRatings.createdAt,
        rating: userRatings.rating,
        userName: users.name,
        filmTitle: film.title,
      })
      .from(userRatings)
      .leftJoin(users, eq(userRatings.userId, users.id))
      .leftJoin(film, eq(userRatings.filmId, film.id))
      .orderBy(desc(userRatings.createdAt))
      .limit(limit)
      .execute();

   
    const recentUsers = await db
      .select({
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .execute();


    const activities = [
      ...recentUploads.map(upload => ({
        action: 'uploaded a new film',
        user: upload.userName,
        time: formatActivityTime(upload.createdAt),
        item: upload.title,
      })),
      ...recentRatings.map(rating => ({
        action: `rated ${rating.rating} stars`,
        user: rating.userName,
        time: formatActivityTime(rating.createdAt),
        item: rating.filmTitle,
      })),
      ...recentUsers.map(user => ({
        action: 'registered',
        user: user.name,
        time: formatActivityTime(user.createdAt),
      })),
    ];

  
    const sortedActivities = activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, limit);

    return NextResponse.json(sortedActivities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ error: 'Failed to fetch recent activity' }, { status: 500 });
  }
}


function formatActivityTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInMinutes < 24 * 60) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (diffInMinutes < 7 * 24 * 60) {
    const days = Math.floor(diffInMinutes / (24 * 60));
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}
