import { NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { playlists } from "@/app/db/schema";

export async function POST(req: Request) {
  const { userId, title, isPublic } = await req.json();
  await db.insert(playlists).values({ userId, title, isPublic });
  return NextResponse.json({ success: true });
}

export async function GET() {
  const results = await db.select().from(playlists);
  return NextResponse.json(results);
}
