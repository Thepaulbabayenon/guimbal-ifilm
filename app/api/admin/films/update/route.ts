import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { CookiesHandler, getUserFromSession } from "@/app/auth/core/session";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
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

    const userId = userSession.id; // Extract authenticated user ID

    const formData = await req.formData();

    const id = Number(formData.get("id"));
    const title = formData.get("title") as string;
    const ageRating = Number(formData.get("age"));
    const duration = Number(formData.get("duration"));
    const overview = formData.get("overview") as string;
    const release = new Date(formData.get("release") as string);
    const category = formData.get("category") as string;
    const producer = formData.get("producer") as string;
    const director = formData.get("director") as string;
    const coDirector = formData.get("coDirector") as string;
    const studio = formData.get("studio") as string;

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid Film ID" }, { status: 400 });
    }

    if (isNaN(release.getTime())) {
      return NextResponse.json({ error: "Invalid release date" }, { status: 400 });
    }

    const releaseTimestamp = Math.floor(release.getTime() / 1000);

    const existingFilm = await db.select().from(film).where(eq(film.id, id)).limit(1);
    if (existingFilm.length === 0) {
      return NextResponse.json({ error: "Film not found" }, { status: 404 });
    }

    const releaseYear = release.getFullYear();

    const imageFile = formData.get("image") as File | null;
    const videoFile = formData.get("video") as File | null;
    const trailerFile = formData.get("trailer") as File | null;

    async function uploadToS3(file: File | null, folder: string): Promise<string> {
      if (!file || !(file instanceof File)) return "";

      const fileKey = `film/${folder}/${releaseYear}/${uuidv4()}-${file.name}`;

      if (typeof file.arrayBuffer !== "function") {
        console.error("Invalid file type for S3 upload:", file);
        throw new TypeError("Provided file does not support arrayBuffer()");
      }

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

    const imageUrl = imageFile ? await uploadToS3(imageFile, "img") : existingFilm[0].imageUrl;
    const videoSource = videoFile ? await uploadToS3(videoFile, "videos") : existingFilm[0].videoSource;
    const trailerUrl = trailerFile ? await uploadToS3(trailerFile, "trailers") : existingFilm[0].trailerUrl;

    await db
      .update(film)
      .set({
        title,
        ageRating,
        duration,
        overview,
        releaseYear: releaseTimestamp,
        category,
        producer,
        director,
        coDirector,
        studio,
        imageUrl,
        videoSource,
        trailerUrl,
        uploadedBy: userId,
      })
      .where(eq(film.id, id));

    return NextResponse.json({ message: "Film updated successfully" });
  } catch (err) {
    console.error("Error updating film:", err);
    return NextResponse.json({ error: "Error updating film" }, { status: 500 });
  }
}
