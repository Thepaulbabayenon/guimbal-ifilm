import { NextResponse, NextRequest } from "next/server"; // ✅ Import NextRequest
import { db } from "@/app/db/drizzle";
import { announcements, dismissedAnnouncements } from "@/app/db/schema";
import { eq, desc, notInArray, sql } from "drizzle-orm"; 
import { getUser } from "@/app/db/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) { // ✅ Explicitly type req
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const offset = (page - 1) * limit;

    // Get dismissed notification IDs
    const dismissed = await db
      .select({ notificationId: dismissedAnnouncements.announcementId })
      .from(dismissedAnnouncements)
      .where(eq(dismissedAnnouncements.userId, user.id));

    const dismissedIds = dismissed.map((d) => d.notificationId);

    // Fetch total count for pagination
    const totalAnnouncements = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(announcements);
    
    const totalPages = Math.ceil(totalAnnouncements[0].count / limit);

    // Fetch paginated & filtered announcements
    const result = await db
      .select()
      .from(announcements)
      .where(dismissedIds.length > 0 ? notInArray(announcements.id, dismissedIds) : undefined)
      .orderBy(desc(announcements.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      announcements: result,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Failed to fetch announcements." }, { status: 500 });
  }
}
