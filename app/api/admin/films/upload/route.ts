import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { db } from '@/app/db/drizzle';
import { film } from '@/app/db/schema';
import { CookiesHandler, getUserFromSession } from '@/app/auth/core/session';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Get session using cookies
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

    const body = await req.json();
    const {
      fileNameImage,
      fileTypeImage,
      fileNameVideo,
      fileTypeVideo,
      fileNameTrailer,
      fileTypeTrailer,
      title,
      ageRating,
      duration,
      overview,
      release,
      category,
      producer,
      director,
      coDirector,
      studio,
    } = body;

    // Extract release year
    const releaseYear = new Date(release).getFullYear();
    if (isNaN(releaseYear)) {
      return NextResponse.json({ error: "Invalid release date" }, { status: 400 });
    }

    // Generate S3 paths
    const imageKey = `film/img/${releaseYear}/${fileNameImage}`;
    const videoKey = `film/videos/${releaseYear}/${fileNameVideo}`;
    const trailerKey = `film/trailers/${releaseYear}/${fileNameTrailer}`;

    const imageParams = { Bucket: process.env.AWS_BUCKET_NAME!, Key: imageKey, ContentType: fileTypeImage };
    const videoParams = { Bucket: process.env.AWS_BUCKET_NAME!, Key: videoKey, ContentType: fileTypeVideo };
    const trailerParams = { Bucket: process.env.AWS_BUCKET_NAME!, Key: trailerKey, ContentType: fileTypeTrailer };

    const uploadURLImage = await getSignedUrl(s3Client, new PutObjectCommand(imageParams), { expiresIn: 60 });
    const uploadURLVideo = await getSignedUrl(s3Client, new PutObjectCommand(videoParams), { expiresIn: 60 });
    const uploadURLTrailer = await getSignedUrl(s3Client, new PutObjectCommand(trailerParams), { expiresIn: 60 });

    if (!uploadURLImage || !uploadURLVideo || !uploadURLTrailer) {
      return NextResponse.json({ error: "Error generating upload URLs" }, { status: 500 });
    }

    if (!ageRating) {
      return NextResponse.json({ error: "Age rating is required" }, { status: 400 });
    }

    // S3 URLs
    const imageString = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
    const videoSource = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoKey}`;
    const trailerSource = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${trailerKey}`;

    await db.insert(film).values({
      title,
      duration,
      overview,
      releaseYear,
      category,
      ageRating,
      imageUrl: imageString,
      videoSource,
      trailerUrl: trailerSource,
      producer,
      director,
      coDirector,
      studio,
      createdAt: new Date(),
      uploadedBy: userId,
    })
    .onConflictDoNothing(); // Prevent duplicate primary key error

    return NextResponse.json({ uploadURLImage, uploadURLVideo, uploadURLTrailer });
  } catch (err) {
    console.error("Error uploading film:", err);
    return NextResponse.json({ error: "Error uploading film" }, { status: 500 });
  }
}
