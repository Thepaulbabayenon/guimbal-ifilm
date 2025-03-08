export const dynamic = "force-dynamic";

import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/app/db/drizzle';
import { CookiesHandler, getUserFromSession } from '@/app/auth/core/session';
import { eq, gte } from 'drizzle-orm';
import { users } from '@/app/db/schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "month";


    const req = new NextRequest(request);
    const cookiesHandler = new CookiesHandler(req);
    
  
    const cookiesObject = Object.fromEntries(req.cookies.getAll().map(c => [c.name, c.value]));
    const userSession = await getUserFromSession(cookiesObject);

    if (!userSession || userSession.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    let dateFilter = new Date();

    if (timeRange === "week") {
      dateFilter.setDate(now.getDate() - 7);
    } else if (timeRange === "month") {
      dateFilter.setMonth(now.getMonth() - 1);
    } else if (timeRange === "year") {
      dateFilter.setFullYear(now.getFullYear() - 1);
    }

  
    const totalUsers = await db.select({ count: count() })
      .from(users)
      .then(result => result[0].count);

  
    const activeUsers = totalUsers; 


    const newUsers = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, dateFilter))
      .then(result => result[0].count);

   
    const adminCount = await db.select({ count: count() })
      .from(users)
      .where(eq(users.role, "admin"))
      .then(result => result[0].count);

    
    const regularUsersCount = await db.select({ count: count() })
      .from(users)
      .where(eq(users.role, "user"))
      .then(result => result[0].count);

    return NextResponse.json({
      total: totalUsers,
      active: activeUsers,  
      newThisMonth: newUsers,
      admins: adminCount,
      regularUsers: regularUsersCount,
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}


import { count } from 'drizzle-orm';