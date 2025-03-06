import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/app/db/drizzle';
import { users, twoFactorSessions } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import * as speakeasy from 'speakeasy';
import { randomUUID } from 'crypto';
import { getUserFromSession, CookiesHandler } from '@/app/auth/core/session'; // Custom session utilities

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    const response = NextResponse.json({});
    const cookies = new CookiesHandler(request, response);

    // Get the current user session
    const sessionData = await getUserFromSession(
      Object.fromEntries([...request.cookies].map(([key, cookie]) => [key, cookie.value]))
    );

    if (!sessionData?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user in the database
    const [user] = await db
      .select({
        id: users.id,
        twoFactorSecret: users.twoFactorSecret,
        twoFactorEnabled: users.twoFactorEnabled,
      })
      .from(users)
      .where(eq(users.id, sessionData.id));

    if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
      return NextResponse.json({ error: 'Two-factor authentication not enabled' }, { status: 400 });
    }

    // Verify the provided 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1, // Allow slight clock drift
    });

    if (!verified) {
      return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 400 });
    }

    // Create a 2FA session record
    const sessionId = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 12); // 12-hour expiry

    await db.insert(twoFactorSessions).values({
      id: sessionId,
      userId: user.id,
      verified: true,
      expiresAt,
    });

    // Set the 2FA session ID in a cookie
    await cookies.set('2fa_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: Date.now() + 12 * 60 * 60 * 1000, // 12 hours in milliseconds
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to verify 2FA login:', error);
    return NextResponse.json({ error: 'Failed to verify 2FA login' }, { status: 500 });
  }
}
