import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { db } from '@/app/db/drizzle';
import { film } from '@/app/db/schema';

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
    const body = await req.json();
    const {
      fileNameImage,
      fileTypeImage,
      fileNameVideo,
      fileTypeVideo,
      fileNameTrailer,
      fileTypeTrailer,
      id,
      title,
      age,
      duration,
      overview,
      release, // Assuming 'release' is a Date object or a string that can be parsed into a Date
      category,
      producer,
      director,
      coDirector,
      studio,
    } = body;

    // Extract the year from the release date
    const releaseYear = new Date(release).getFullYear(); // Or: const releaseYear = new Date(Date.parse(release)).getFullYear(); if 'release' is a string
    if (isNaN(releaseYear)) {
      return NextResponse.json({ error: 'Invalid release date' }, { status: 400 });
    }

    // Construct S3 keys with the year folder
    const imageKey = `film/img/${releaseYear}/${fileNameImage}`;
    const videoKey = `film/videos/${releaseYear}/${fileNameVideo}`;
    const trailerKey = `film/trailers/${releaseYear}/${fileNameTrailer}`;

    // Log input data to check
    console.log('Received file data:', { fileNameImage, fileTypeImage, fileNameVideo, fileTypeVideo, fileNameTrailer, fileTypeTrailer, releaseYear });

    // Generate signed URLs
    const imageParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: imageKey,
      ContentType: fileTypeImage,
    };
    const videoParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: videoKey,
      ContentType: fileTypeVideo,
    };
    const trailerParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: trailerKey,
      ContentType: fileTypeTrailer,
    };

    const imageCommand = new PutObjectCommand(imageParams);
    const videoCommand = new PutObjectCommand(videoParams);
    const trailerCommand = new PutObjectCommand(trailerParams);

    const uploadURLImage = await getSignedUrl(s3Client, imageCommand, { expiresIn: 60 });
    const uploadURLVideo = await getSignedUrl(s3Client, videoCommand, { expiresIn: 60 });
    const uploadURLTrailer = await getSignedUrl(s3Client, trailerCommand, { expiresIn: 60 });

    // Log the generated signed URLs
    console.log('Generated signed URLs:', { uploadURLImage, uploadURLVideo, uploadURLTrailer });

    // Check if URLs are generated (important!)
    if (!uploadURLImage || !uploadURLVideo || !uploadURLTrailer) {
      console.error('Error: One or more upload URLs are not generated.');
      return NextResponse.json({ error: 'Error generating upload URLs' }, { status: 500 });
    }

    // Construct the S3 paths for database storage, including the year
    const imageString = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
    const videoSource = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoKey}`;
    const trailerSource = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${trailerKey}`;

    // Insert film metadata into NeonDB
    await db.insert(film).values({
      id,
      imageString,
      title,
      age,
      duration,
      overview,
      release,
      category,
      videoSource,
      trailer: trailerSource,
      producer,
      director,
      coDirector,
      studio,
      createdAt: new Date(),
    });

    return NextResponse.json({ uploadURLImage, uploadURLVideo, uploadURLTrailer });
  } catch (err) {
    console.error('Error uploading film:', err);
    return NextResponse.json({ error: 'Error uploading film' }, { status: 500 });
  }
}