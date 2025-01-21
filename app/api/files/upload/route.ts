import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { db } from '@/db/drizzle'; // Adjust the import for your DB connection
import { film } from '@/db/schema';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fileNameImage,
      fileTypeImage,
      fileNameVideo,
      fileTypeVideo,
      id,
      title,
      age,
      duration,
      overview,
      release,
      category,
      producer,
      director,
      coDirector,
      studio,
    } = body;

    // Log input data to check
    console.log('Received file data:', { fileNameImage, fileTypeImage, fileNameVideo, fileTypeVideo });

    // Generate signed URLs for the image and video
    const imageParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `film/img/${fileNameImage}`,
      ContentType: fileTypeImage,
    };
    const videoParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `film/videos/${fileNameVideo}`,
      ContentType: fileTypeVideo,
    };

    const imageCommand = new PutObjectCommand(imageParams);
    const videoCommand = new PutObjectCommand(videoParams);

    const uploadURLImage = await getSignedUrl(s3Client, imageCommand, { expiresIn: 60 });
    const uploadURLVideo = await getSignedUrl(s3Client, videoCommand, { expiresIn: 60 });

    // Log the generated signed URLs
    console.log('Generated signed URLs:', { uploadURLImage, uploadURLVideo });

    // Check if the video URL is generated successfully
    if (!uploadURLVideo) {
      console.error('Error: Video upload URL is not generated.');
      return NextResponse.json({ error: 'Error generating video upload URL' }, { status: 500 });
    }

    // Insert film metadata into NeonDB
    await db.insert(film).values({
      id,
      imageString: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/film/img/${fileNameImage}`,
      title,
      age,
      duration,
      overview,
      release,
      category,
      videoSource: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/film/videos/${fileNameVideo}`,
      trailer: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/film/videos/${fileNameVideo}`,
      producer,
      director,
      coDirector,
      studio,
      createdAt: new Date(),
    });

    return NextResponse.json({ uploadURLImage, uploadURLVideo });
  } catch (err) {
    console.error('Error uploading film:', err);
    return NextResponse.json({ error: 'Error uploading film' }, { status: 500 });
  }
}
