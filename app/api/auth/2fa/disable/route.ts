import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/app/db/drizzle';
import { users } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { getUserFromSession, CookiesHandler } from '@/app/auth/core/session'; // Assuming you store these utilities in a session file

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({});
    const cookies = new CookiesHandler(request, response);
    
    // Get the current user session
    const sessionData = await getUserFromSession(Object.fromEntries(
      [...request.cookies].map(([key, cookie]) => [key, cookie.value])
    ));

    if (!sessionData?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user in the database
    const [user] = await db.select({
      id: users.id,
    })
    .from(users)
    .where(eq(users.id, sessionData.id));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the user to disable 2FA
    await db.update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
      })
      .where(eq(users.id, user.id));

    // Clear 2FA session if any
    cookies.delete('2fa_session');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disable 2FA:', error);
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
  }
}
