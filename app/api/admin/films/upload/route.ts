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

    // Validate required fields
    if (!title || !duration || !overview || !release || !category || !ageRating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Extract release year - handle both number and date string formats
    let releaseYear;
    if (typeof release === 'number') {
      releaseYear = release;
    } else {
      releaseYear = parseInt(release);
      if (isNaN(releaseYear)) {
        return NextResponse.json({ error: "Invalid release year" }, { status: 400 });
      }
    }

    // Generate S3 paths with unique identifiers to prevent overwriting
    const timestamp = Date.now();
    const imageKey = `film/img/${releaseYear}/${timestamp}_${fileNameImage}`;
    const videoKey = `film/videos/${releaseYear}/${timestamp}_${fileNameVideo}`;
    const trailerKey = `film/trailers/${releaseYear}/${timestamp}_${fileNameTrailer}`;

    const imageParams = { Bucket: process.env.AWS_BUCKET_NAME!, Key: imageKey, ContentType: fileTypeImage };
    const videoParams = { Bucket: process.env.AWS_BUCKET_NAME!, Key: videoKey, ContentType: fileTypeVideo };
    const trailerParams = { Bucket: process.env.AWS_BUCKET_NAME!, Key: trailerKey, ContentType: fileTypeTrailer };

    const uploadURLImage = await getSignedUrl(s3Client, new PutObjectCommand(imageParams), { expiresIn: 600 });
    const uploadURLVideo = await getSignedUrl(s3Client, new PutObjectCommand(videoParams), { expiresIn: 600 });
    const uploadURLTrailer = await getSignedUrl(s3Client, new PutObjectCommand(trailerParams), { expiresIn: 600 });

    if (!uploadURLImage || !uploadURLVideo || !uploadURLTrailer) {
      return NextResponse.json({ error: "Error generating upload URLs" }, { status: 500 });
    }

    // S3 URLs
    const imageString = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
    const videoSource = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoKey}`;
    const trailerSource = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${trailerKey}`;

    console.log("Inserting film into database with the following details:");
    console.log({
      title,
      duration: Number(duration),
      overview,
      releaseYear,
      category,
      ageRating: Number(ageRating),
      imageUrl: imageString,
      videoSource,
      trailerUrl: trailerSource,
      producer,
      director,
      coDirector,
      studio,
      uploadedBy: userId
    });

    try {
      // Do not specify an ID - let the database auto-increment handle it
      const insertResult = await db.insert(film).values({
        title,
        duration: Number(duration),
        overview,
        releaseYear,
        category,
        ageRating: Number(ageRating),
        imageUrl: imageString,
        videoSource,
        trailerUrl: trailerSource,
        producer,
        director,
        coDirector,
        studio,
        createdAt: new Date(),
        uploadedBy: userId,
      }).returning({ 
        insertedId: film.id,
        insertedTitle: film.title 
      });
      
      console.log("Database insert result:", insertResult);
      
      return NextResponse.json({ 
        success: true,
        filmId: insertResult[0]?.insertedId,
        uploadURLImage, 
        uploadURLVideo, 
        uploadURLTrailer,
        filmData: {
          title,
          releaseYear,
          imageUrl: imageString,
          videoSource,
          trailerUrl: trailerSource
        }
      });
    } catch (error: unknown) {
      const dbError = error instanceof Error ? error : new Error(String(error));
      console.error("Database insert error:", dbError);
      
      // Check for duplicate key error
      if (dbError.message.includes('duplicate key') || dbError.message.includes('23505')) {
        return NextResponse.json({ 
          error: "A film with this ID already exists. Try using a different title or try again.", 
          details: dbError.message 
        }, { status: 409 }); // 409 Conflict status code
      }
      
      return NextResponse.json({ 
        error: "Failed to insert film in database", 
        details: dbError.message 
      }, { status: 500 });
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Error uploading film:", err);
    return NextResponse.json({ 
      error: "Error uploading film", 
      details: err.message 
    }, { status: 500 });
  }
}