import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema";
import { eq } from "drizzle-orm";

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Film ID is required" }, { status: 400 });
    }

    // Fetch film metadata from DB
    const filmData = await db.select().from(film).where(eq(film.id, id));
    if (!filmData.length) {
      return NextResponse.json({ error: "Film not found" }, { status: 404 });
    }

    const { imageString, videoSource, trailer } = filmData[0];

    // Extract S3 keys from URLs
    const extractKey = (url: string) => {
      return url ? url.split(".com/")[1]?.split("?")[0] : null;
    };

    const imageKey = extractKey(imageString);
    const videoKey = extractKey(videoSource);
    const trailerKey = extractKey(trailer);

    console.log("Files to delete:", { imageKey, videoKey, trailerKey });

    // Function to check and delete file from S3
    const deleteFile = async (key: string | null) => {
      if (!key) return;

      try {
        // Check if the file exists in S3 before deleting
        await s3Client.send(new HeadObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME!, Key: key }));

        // Proceed with deletion
        const deleteResponse = await s3Client.send(new DeleteObjectCommand({ 
          Bucket: process.env.AWS_BUCKET_NAME!, 
          Key: key 
        }));
        
        console.log(`Deleted: ${key}`, deleteResponse);
      } catch (error: any) {
        if (error.name === "NotFound") {
          console.warn(`File not found in S3: ${key}`);
        } else {
          console.error(`Error deleting ${key}:`, error);
        }
      }
    };

    // Delete all files asynchronously
    await Promise.all([deleteFile(imageKey), deleteFile(videoKey), deleteFile(trailerKey)]);

    // Delete film from the database
    await db.delete(film).where(eq(film.id, id));

    return NextResponse.json({ message: "Film deleted successfully" });
  } catch (err) {
    console.error("Error deleting film:", err);
    return NextResponse.json({ error: "Error deleting film" }, { status: 500 });
  }
}
