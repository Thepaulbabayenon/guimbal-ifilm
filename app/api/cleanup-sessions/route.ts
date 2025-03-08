// pages/api/cleanup-sessions.ts or app/api/cleanup-sessions/route.ts (depending on your Next.js version)
import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredSessions } from '@/app/auth/core/session';

export async function GET(request: NextRequest) {
 
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;
  
  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const deletedCount = await cleanupExpiredSessions();
    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clean up sessions' }, { status: 500 });
  }
}