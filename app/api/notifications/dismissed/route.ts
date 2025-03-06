import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { dismissedAnnouncements } from "@/app/db/schema";
import { getUserFromSession, CookiesHandler } from "@/app/auth/core/session"; 

export async function POST(req: NextRequest) { 
  try {

    const cookiesObject: Record<string, string> = Object.fromEntries(
      req.cookies.getAll().map((cookie) => [cookie.name, cookie.value])
    );
    

 
    const user = await getUserFromSession(cookiesObject);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { announcementId } = await req.json();
    
    if (!announcementId || isNaN(Number(announcementId))) {
      return NextResponse.json({ error: "Invalid announcementId" }, { status: 400 });
    }

    await db.insert(dismissedAnnouncements).values({
      userId: user.id,
      announcementId: Number(announcementId),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error dismissing announcement:", error);
    return NextResponse.json({ error: "Failed to dismiss announcement." }, { status: 500 });
  }
}
