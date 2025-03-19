// app/api/files/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();
    
    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and contentType are required" }, { status: 400 });
    }
    

    const key = `uploads/${Date.now()}-${filename}`;
    

    const uploadUrl = await getPresignedUploadUrl(key, contentType);
    
    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}