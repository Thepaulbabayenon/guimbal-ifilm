import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle'; // Adjust the import to match your NeonDB setup
import { film } from '@/db/schema'; // Adjust the import to match your films table schema
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
console.log('AWS Access Key ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS Region:', process.env.AWS_REGION);


export async function POST(req: NextRequest) {
  let body;

  try {
    // Step 1: Validate the Content-Type header
    if (req.headers.get('Content-Type') !== 'application/json') {
      return NextResponse.json(
        { error: 'Invalid content type. Expected application/json.' },
        { status: 401 }
      );
    }

    // Step 2: Parse the request body
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    try {
      body = JSON.parse(rawBody); // Parsing JSON manually for better error handling
    } catch (err) {
      console.error('Invalid JSON payload:', err);
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 402 });
    }

    // Step 3: Destructure required fields from the request body
    const {
      fileNameImage, fileTypeImage, fileNameVideo, fileTypeVideo,
      id, title, age, duration, overview, release, category,
      producer, director, coDirector, studio,
    } = body;

    // Step 4: Validate required fields
    if (!fileNameImage || !fileTypeImage || !fileNameVideo || !fileTypeVideo) {
      return NextResponse.json({ error: 'File information is missing.' }, { status: 408 });
    }

    if (!id || !title || !age || !duration || !overview || !release || !category) {
      return NextResponse.json(
        { error: 'Film metadata fields are missing.' },
        { status: 407 }
      );
    }

    // Step 5: Generate signed URLs for S3 uploads
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

    try {
      const imageCommand = new PutObjectCommand(imageParams);
      const videoCommand = new PutObjectCommand(videoParams);

      const uploadURLImage = await getSignedUrl(s3Client, imageCommand, { expiresIn: 60 });
      const uploadURLVideo = await getSignedUrl(s3Client, videoCommand, { expiresIn: 60 });

      console.log('Generated signed URLs for S3:', { uploadURLImage, uploadURLVideo });

      // Step 6: Save film metadata to NeonDB
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

      // Step 7: Return success response with signed URLs
      return NextResponse.json(
        {
          uploadURLImage,
          uploadURLVideo,
          message: 'Film metadata and files uploaded successfully.',
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error generating signed URLs for S3:', error);
      return NextResponse.json({ error: 'Error generating signed URLs for S3.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error uploading files or saving metadata to the database:', error);
    return NextResponse.json(
      { error: 'Error uploading files or saving metadata to the database.' },
      { status: 500 }
    );
  }
}
