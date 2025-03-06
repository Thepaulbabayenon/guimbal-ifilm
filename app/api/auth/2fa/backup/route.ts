import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { users, twoFactorSessions } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { CookiesHandler, getUserFromSession } from '@/app/auth/core/session'; // Adjust path as needed

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({});
    const cookies = new CookiesHandler(request, response);
    const { backupCode } = await request.json();
    
    // Get the current user session
    const sessionData = await getUserFromSession(
      Object.fromEntries(
        [...request.cookies].map(([key, cookie]) => [key, cookie.value])
      )
    );
    
    
    if (!sessionData?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find the user in the database
    const [user] = await db.select({
      id: users.id,
      twoFactorEnabled: users.twoFactorEnabled,
      twoFactorBackupCodes: users.twoFactorBackupCodes,
    })
    .from(users)
    .where(eq(users.id, sessionData.id));
    
    if (!user || !user.twoFactorEnabled || !user.twoFactorBackupCodes?.length) {
      return NextResponse.json({ error: 'Two-factor authentication not enabled or no backup codes available' }, { status: 400 });
    }
    
    // Check if the provided backup code is valid
    const normalizedBackupCode = backupCode.toUpperCase().trim();
    const validBackupCode = user.twoFactorBackupCodes.includes(normalizedBackupCode);
    
    if (!validBackupCode) {
      return NextResponse.json({ success: false, error: 'Invalid backup code' }, { status: 400 });
    }
    
    // Remove the used backup code
    const updatedBackupCodes = user.twoFactorBackupCodes.filter(
      code => code !== normalizedBackupCode
    );
    
    await db.update(users)
      .set({ twoFactorBackupCodes: updatedBackupCodes })
      .where(eq(users.id, user.id));
    
    // Create a 2FA session record
    const twoFaSessionId = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 12); // 12 hour expiry
    
    await db.insert(twoFactorSessions)
      .values({
        id: twoFaSessionId,
        userId: user.id,
        verified: true,
        expiresAt,
      });
    
    // Set the 2FA session ID in a cookie
    await cookies.set('2fa_session', twoFaSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: Date.now() + 12 * 60 * 60 * 1000, // 12 hours in milliseconds
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Backup code accepted. This code cannot be used again.',
      remainingCodes: updatedBackupCodes.length 
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to verify backup code:', error);
    return NextResponse.json({ error: 'Failed to verify backup code' }, { status: 500 });
  }
}