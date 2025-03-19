import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

// POST handler for getting presigned URLs
export async function POST(req: NextRequest) {
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

    // Parse the request body
    const { fileName, fileType, fileSize, folder, releaseYear } = await req.json();
    
    // Generate a unique filename
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const fileKey = `film/${folder}/${releaseYear}/${uniqueFileName}`;
    
    // Create a presigned URL for uploading
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
      ContentType: fileType,
    });
    
    // Generate a presigned URL that expires in 5 minutes
    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 300 });
    
    // Generate the final URL for the file
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    
    return NextResponse.json({ uploadUrl, fileUrl });
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    return NextResponse.json({ error: "Error generating upload URL" }, { status: 500 });
  }
}

// PUT handler for updating film details
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

    // Parse the request body (assuming it's now JSON, not formData)
    const data = await req.json();
    
    const id = Number(data.id);
    const title = data.title;
    const ageRating = Number(data.ageRating);
    const duration = Number(data.duration);
    const overview = data.overview;
    const releaseYear = parseInt(data.release);
    const category = data.category;
    const producer = data.producer;
    const director = data.director;
    const coDirector = data.coDirector;
    const studio = data.studio;
    const imageUrl = data.imageUrl || "";
    const videoSource = data.videoSource || "";
    const trailerUrl = data.trailerUrl || "";

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid Film ID" }, { status: 400 });
    }

  


    const existingFilm = await db.select().from(film).where(eq(film.id, id)).limit(1);
    if (existingFilm.length === 0) {
      return NextResponse.json({ error: "Film not found" }, { status: 404 });
    }

    await db
      .update(film)
      .set({
        title,
        ageRating,
        duration,
        overview,
        releaseYear,
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