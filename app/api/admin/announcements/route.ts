export const dynamic = "force-dynamic";


import { NextResponse } from "next/server";
import { db } from "@/app/db/drizzle"; 
import { announcements } from "@/app/db/schema";
import { desc } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { title, content, adminId } = await req.json();

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
    }

    await db.insert(announcements).values({ adminId, title, content });

    return NextResponse.json({ success: true, message: "Announcement created!" }, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1; 
    const limit = Number(searchParams.get("limit")) || 10; 
    const offset = (page - 1) * limit;

    const totalAnnouncements = await db.select().from(announcements);
    const total = totalAnnouncements.length;

  
    const latestAnnouncements = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ data: latestAnnouncements, total });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

