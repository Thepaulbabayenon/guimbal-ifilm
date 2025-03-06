import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/app/db/drizzle';
import { users } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import * as speakeasy from 'speakeasy';
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
      })
      .from(users)
      .where(eq(users.id, sessionData.id));

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: 'Two-factor authentication not set up' }, { status: 400 });
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

    // Enable 2FA for the user
    await db.update(users)
      .set({ twoFactorEnabled: true })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to verify 2FA:', error);
    return NextResponse.json({ error: 'Failed to verify 2FA' }, { status: 500 });
  }
}
