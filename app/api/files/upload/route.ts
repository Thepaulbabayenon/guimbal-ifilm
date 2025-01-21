import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle'; // Adjust the import to match your NeonDB setup
import { film } from '@/db/schema'; // Adjust import for your films table schema
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client from AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const {
      fileNameImage, fileTypeImage, fileNameVideo, fileTypeVideo,
      id, title, age, duration, overview, release, category,
      producer, director, coDirector, studio,
    } = await req.json();

    // Validate the required fields
    if (!fileNameImage || !fileTypeImage || !fileNameVideo || !fileTypeVideo) {
      return NextResponse.json({ error: 'File information is missing.' }, { status: 400 });
    }

    // Step 1: Upload Image to S3
    const imageParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `film/img/${fileNameImage}`,
      Expires: new Date(Date.now() + 60 * 1000), // Expires in 60 seconds
      ContentType: fileTypeImage,
      ACL: 'public-read' as const, // Correct ACL type
    };
    const imageCommand = new PutObjectCommand(imageParams);
    const uploadURLImage = await getSignedUrl(s3Client, imageCommand, { expiresIn: 60 });

    // Step 2: Upload Video to S3
    const videoParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `film/videos/${fileNameVideo}`,
      Expires: new Date(Date.now() + 60 * 1000), // Expires in 60 seconds
      ContentType: fileTypeVideo,
      ACL: 'public-read' as const, // Correct ACL type
    };
    const videoCommand = new PutObjectCommand(videoParams);
    const uploadURLVideo = await getSignedUrl(s3Client, videoCommand, { expiresIn: 60 });

    // Step 3: Save Film Metadata into NeonDB
    await db.insert(film).values({
      id,
      imageString: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/film/img/${fileNameImage}`,
      title,
      age,
      duration,
      overview,
      release,
      category,
      videoSource: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/film/video/${fileNameVideo}`,
      trailer: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/film.video/${fileNameVideo}`, // You can adjust this trailer or leave it empty for now
      producer,
      director,
      coDirector,
      studio,
      createdAt: new Date(),
    });

    // Step 4: Return the response with the signed URLs
    return NextResponse.json({
      uploadURLImage,
      uploadURLVideo,
      message: "Film metadata and files uploaded successfully.",
    }, { status: 200 });

  } catch (error) {
    console.error('Error uploading files or saving metadata to the database:', error);
    return NextResponse.json({ error: 'Error uploading files or saving data to the database.' }, { status: 500 });
  }
}
