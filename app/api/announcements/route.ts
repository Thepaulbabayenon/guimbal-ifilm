import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { announcements, dismissedAnnouncements } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { getUserFromSession, COOKIE_SESSION_KEY } from '@/app/auth/core/session';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get the current user session using cookies
    const cookies = Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value]));
    const session = await getUserFromSession(cookies);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.id;
    
    // Fetch active announcements
    const activeAnnouncements = await db.select()
      .from(announcements)
      .where(eq(announcements.isActive, true))
      .orderBy(announcements.createdAt);
    
    // Fetch dismissed announcements for the current user
    const userDismissed = await db.select()
      .from(dismissedAnnouncements)
      .where(eq(dismissedAnnouncements.userId, userId));
    
    // Create a set of dismissed announcement IDs for efficient lookup
    const dismissedIds = new Set(userDismissed.map(item => item.announcementId));
    
    // Filter out announcements that the user has already dismissed
    const filteredAnnouncements = activeAnnouncements.filter(
      announcement => !dismissedIds.has(announcement.id)
    );
    
    return NextResponse.json({ 
      announcements: filteredAnnouncements,
      total: filteredAnnouncements.length
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}