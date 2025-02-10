import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Extract and type-cast fields correctly
    const id = Number(formData.get("id")); // Ensure id is a number
    const title = formData.get("title") as string;
    const age = Number(formData.get("age"));
    const duration = Number(formData.get("duration"));
    const overview = formData.get("overview") as string;
    const release = new Date(formData.get("release") as string); // Ensure release is a Date

    // Declare missing fields to avoid TypeScript errors
    const category = formData.get("category") as string; // Initialize category
    const producer = formData.get("producer") as string; // Initialize producer
    const director = formData.get("director") as string; // Initialize director
    const coDirector = formData.get("coDirector") as string; // Initialize coDirector
    const studio = formData.get("studio") as string; // Initialize studio

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid Film ID" }, { status: 400 });
    }

    if (isNaN(release.getTime())) {
      return NextResponse.json({ error: "Invalid release date" }, { status: 400 });
    }

    // Convert the Date to a Unix timestamp (number)
    const releaseTimestamp = release.getTime();

    // Fetch existing film data to preserve existing file URLs
    const existingFilm = await db.select().from(film).where(eq(film.id, id)).limit(1);
    if (existingFilm.length === 0) {
      return NextResponse.json({ error: "Film not found" }, { status: 404 });
    }
    
    const releaseYear = release.getFullYear();

    // Extract files from formData
    const imageFile = formData.get("image") as File | null;
    const videoFile = formData.get("video") as File | null;
    const trailerFile = formData.get("trailer") as File | null;

    // Function to upload files to S3
    async function uploadToS3(file: File, folder: string): Promise<string> {
      if (!file) return "";

      const fileKey = `film/${folder}/${releaseYear}/${uuidv4()}-${file.name}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: fileKey,
          Body: buffer,
          ContentType: file.type,
        })
      );

      return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    }

    // Upload new files if provided, otherwise keep the existing ones
    const imageString = imageFile ? await uploadToS3(imageFile, "img") : existingFilm[0].imageString;
    const videoSource = videoFile ? await uploadToS3(videoFile, "videos") : existingFilm[0].videoSource;
    const trailerSource = trailerFile ? await uploadToS3(trailerFile, "trailers") : existingFilm[0].trailer;

    // Update film metadata in the database
    await db
      .update(film)
      .set({
        title,
        age,
        duration,
        overview,
        release: releaseTimestamp, // Use releaseTimestamp (number)
        category, // Use category (initialized)
        producer, // Use producer (initialized)
        director, // Use director (initialized)
        coDirector, // Use coDirector (initialized)
        studio, // Use studio (initialized)
        imageString,
        videoSource,
        trailer: trailerSource,
      })
      .where(eq(film.id, id));

    return NextResponse.json({ message: "Film updated successfully" });
  } catch (err) {
    console.error("Error updating film:", err);
    return NextResponse.json({ error: "Error updating film" }, { status: 500 });
  }
}
