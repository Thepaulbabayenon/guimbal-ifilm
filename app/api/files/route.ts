// app/api/files/route.ts
import { NextRequest, NextResponse } from "next/server";
import { listFiles, getSignedFileUrl, deleteFile, getPresignedUploadUrl } from "@/lib/s3";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prefix = searchParams.get("prefix") || "";
    
    const files = await listFiles(prefix);
    
    // Get signed URLs for each file
    const filesWithUrls = await Promise.all(files.map(async (file) => {
      const url = await getSignedFileUrl(file.key);
      return { ...file, url };
    }));
    
    return NextResponse.json({ files: filesWithUrls });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { key } = await request.json();
    
    if (!key) {
      return NextResponse.json({ error: "File key is required" }, { status: 400 });
    }
    
    await deleteFile(key);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}