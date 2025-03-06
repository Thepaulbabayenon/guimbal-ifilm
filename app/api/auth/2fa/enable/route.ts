import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/app/db/drizzle';
import { users } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { getUserFromSession, CookiesHandler } from '@/app/auth/core/session'; 

// Function to generate backup codes
function generateBackupCodes(count: number = 8): string[] {
  return Array.from({ length: count }, () =>
    Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 6))
      .join('-')
      .toUpperCase()
  );
}

export async function POST(request: NextRequest) {
  try {
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
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionData.id));

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate a new secret for 2FA
    const secret = speakeasy.generateSecret({
      name: `YourApp:${sessionData.role}`,
    });

    // Generate QR code for authentication apps
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Store the secret and backup codes in the database
    await db.update(users)
      .set({
        twoFactorSecret: secret.base32,
        twoFactorBackupCodes: backupCodes,
        twoFactorEnabled: false,
      })
      .where(eq(users.id, userRecord.id));

    return NextResponse.json({
      qrCodeUrl,
      secretKey: secret.base32,
      backupCodes,
    });
  } catch (error) {
    console.error('Failed to enable 2FA:', error);
    return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 });
  }
}
