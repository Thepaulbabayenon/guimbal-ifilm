import { NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { announcements, dismissedAnnouncements } from "@/app/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getUser } from "@/app/db/auth";

export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get dismissed announcement IDs for the user
    const dismissed = await db
      .select({ announcementId: dismissedAnnouncements.announcementId })
      .from(dismissedAnnouncements)
      .where(eq(dismissedAnnouncements.userId, user.id));

    const dismissedIds = dismissed.map((d) => d.announcementId);
    
    if (dismissedIds.length === 0) {
      return NextResponse.json({ dismissedAnnouncements: [] });
    }

    // Retrieve full dismissed announcement details
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
