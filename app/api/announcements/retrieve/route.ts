import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { announcements, dismissedAnnouncements } from "@/app/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getUserFromSession } from "@/app/auth/core/session"; 

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {

    const cookies = req.cookies.getAll().reduce((acc, cookie) => {
      acc[cookie.name] = cookie.value;
      return acc;
    }, {} as Record<string, string>);

  
    const user = await getUserFromSession(cookies);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

   
    const dismissed = await db
      .select({ announcementId: dismissedAnnouncements.announcementId })
      .from(dismissedAnnouncements)
      .where(eq(dismissedAnnouncements.userId, user.id));

    const dismissedIds = dismissed.map((d) => d.announcementId);
    
    if (dismissedIds.length === 0) {
      return NextResponse.json({ dismissedAnnouncements: [] });
    }

 
    const dismissedAnnouncementsList = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        createdAt: announcements.createdAt
      })
      .from(announcements)
      .where(inArray(announcements.id, dismissedIds));

    return NextResponse.json({ dismissedAnnouncements: dismissedAnnouncementsList });
  } catch (error) {
    console.error("Error retrieving dismissed announcements:", error);
    return NextResponse.json({ error: "Failed to retrieve dismissed announcements." }, { status: 500 });
  }
}