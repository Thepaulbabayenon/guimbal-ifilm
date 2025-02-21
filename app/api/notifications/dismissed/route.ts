import { NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { dismissedAnnouncements } from "@/app/db/schema";
import { getUser } from "@/app/db/auth"; 

export async function POST(req: Request) { 
  try {
    const user = await getUser(); 
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { announcementId } = await req.json(); // ✅ Fix: Changed to announcementId
    if (!announcementId) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    // Store dismissed announcement
    await db.insert(dismissedAnnouncements).values({
      userId: user.id,
      announcementId, // ✅ Fix: Changed notificationId to announcementId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error dismissing announcement:", error);
    return NextResponse.json({ error: "Failed to dismiss announcement." }, { status: 500 });
  }
}
