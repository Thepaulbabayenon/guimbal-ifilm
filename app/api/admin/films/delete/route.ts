import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { CookiesHandler, getUserFromSession } from "@/app/auth/core/session";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    // Get user session
    const cookiesHandler = new CookiesHandler(req);
    const cookieObject: Record<string, string> = {};

    req.cookies.getAll().forEach(cookie => {
      cookieObject[cookie.name] = cookie.value;
    });

    const userSession = await getUserFromSession(cookieObject);

    if (!userSession || !userSession.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Film ID is required" }, { status: 400 });
    }

    // Fetch film data
    const filmData = await db.select().from(film).where(eq(film.id, id));
    if (!filmData.length) {
      return NextResponse.json({ error: "Film not found" }, { status: 404 });
    }

    const { imageUrl, videoSource, trailerUrl } = filmData[0];

    // Extract S3 object keys from URLs
    const extractKey = (url: string) => url ? url.split(".com/")[1]?.split("?")[0] : null;

    const imageKey = extractKey(imageUrl);
    const videoKey = extractKey(videoSource);
    const trailerKey = extractKey(trailerUrl);

    console.log("Files to delete:", { imageKey, videoKey, trailerKey });

    // Function to delete files from S3
    const deleteFile = async (key: string | null) => {
      if (!key) return;

      try {
        // Check if file exists before deleting
        await s3Client.send(new HeadObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME!, Key: key }));

        // Delete file from S3
        await s3Client.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME!, Key: key }));

        console.log(`Deleted: ${key}`);
      } catch (error: any) {
        if (error.name === "NotFound") {
          console.warn(`File not found in S3: ${key}`);
        } else {
          console.error(`Error deleting ${key}:`, error);
        }
      }
    };

    // Delete all associated files
    await Promise.all([deleteFile(imageKey), deleteFile(videoKey), deleteFile(trailerKey)]);

    // Delete film from database
    await db.delete(film).where(eq(film.id, id));

    return NextResponse.json({ message: "Film deleted successfully" });
  } catch (err) {
    console.error("Error deleting film:", err);
    return NextResponse.json({ error: "Error deleting film" }, { status: 500 });
  }
}
