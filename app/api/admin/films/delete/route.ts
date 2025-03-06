import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema";
import { eq } from "drizzle-orm";


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
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Film ID is required" }, { status: 400 });
    }

 
    const filmData = await db.select().from(film).where(eq(film.id, id));
    if (!filmData.length) {
      return NextResponse.json({ error: "Film not found" }, { status: 404 });
    }

    const { imageUrl, videoSource, trailerUrl } = filmData[0];

  
    const extractKey = (url: string) => {
      return url ? url.split(".com/")[1]?.split("?")[0] : null;
    };

    const imageKey = extractKey(imageUrl);
    const videoKey = extractKey(videoSource);
    const trailerKey = extractKey(trailerUrl);

    console.log("Files to delete:", { imageKey, videoKey, trailerKey });


    const deleteFile = async (key: string | null) => {
      if (!key) return;

      try {
     
        await s3Client.send(new HeadObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME!, Key: key }));

     
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


    await Promise.all([deleteFile(imageKey), deleteFile(videoKey), deleteFile(trailerKey)]);

  
    await db.delete(film).where(eq(film.id, id));

    return NextResponse.json({ message: "Film deleted successfully" });
  } catch (err) {
    console.error("Error deleting film:", err);
    return NextResponse.json({ error: "Error deleting film" }, { status: 500 });
  }
}
