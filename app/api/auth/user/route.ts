export const dynamic = "force-dynamic"; // Forces the API to run on every request

import { NextResponse, NextRequest } from 'next/server';
import { getUserFromSession, CookiesHandler, COOKIE_SESSION_KEY } from "@/app/auth/core/session"; 
import { db } from '@/app/db/drizzle';
import { users, twoFactorSessions } from '@/app/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { cookies } from 'next/headers';

interface User {
  id: string;
  role: "admin" | "user";
  twoFactorEnabled?: boolean;
  name?: string;
  image?: string;
  email?: string;
}

export async function GET(request: NextRequest) {
  try {
    const cookiesHandler = new CookiesHandler(request);
    const sessionUser: User | null = await getUserFromSession({
      [COOKIE_SESSION_KEY]: cookiesHandler.get(COOKIE_SESSION_KEY)?.value || "",
    });

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch additional user details from the database
    const [fullUserData] = await db.select({
      id: users.id,
      role: users.role,
      twoFactorEnabled: users.twoFactorEnabled,
      name: users.name,
      email: users.email,
      image: users.image
    })
    .from(users)
    .where(eq(users.id, sessionUser.id));

    if (!fullUserData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let twoFactorVerified = false;

    if (fullUserData.twoFactorEnabled) {
      const cookieStore = await cookies();
      const sessionId = cookieStore.get('2fa_session')?.value;

      if (sessionId) {
        const [twoFASession] = await db.select({
          id: twoFactorSessions.id,
          verified: twoFactorSessions.verified,
        })
        .from(twoFactorSessions)
        .where(
          and(
            eq(twoFactorSessions.id, sessionId),
            eq(twoFactorSessions.userId, fullUserData.id),
            eq(twoFactorSessions.verified, true),
            gt(twoFactorSessions.expiresAt, new Date())
          )
        );

        twoFactorVerified = !!twoFASession?.verified;
      }
    } else {
      twoFactorVerified = true;
    }

    const userData = {
      ...fullUserData,
      twoFactorVerified,
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}