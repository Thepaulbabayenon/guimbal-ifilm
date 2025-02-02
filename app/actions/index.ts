// /actions/index.ts
'use server';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle'; // Adjust the import to match your NeonDB setup
import { film } from '@/app/db/schema'; // Adjust import for your films table schema
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

// Helper function to generate signed upload URL for S3
async function generateSignedUploadUrl(fileName: string, fileType: string) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `${fileName}`, // Correct path for files
    ContentType: fileType,
    ACL: 'public-read' as const, // Set ACL to make the file publicly readable
  };

  const command = new PutObjectCommand(params);
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

  return signedUrl;
}

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

    // Generate signed URLs for image and video
    const uploadURLImage = await generateSignedUploadUrl(fileNameImage, fileTypeImage);
    const uploadURLVideo = await generateSignedUploadUrl(fileNameVideo, fileTypeVideo);

    // Save Film Metadata into NeonDB
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
      trailer: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/film/video/${fileNameVideo}`, // You can adjust this for trailer or leave it empty for now
      producer,
      director,
      coDirector,
      studio,
      createdAt: new Date(),
    });

    // Return the response with the signed URLs
    return NextResponse.json({
      uploadURLImage,
      uploadURLVideo,
      message: 'Film metadata and files uploaded successfully.',
    }, { status: 200 });

  } catch (error) {
    console.error('Error uploading files or saving metadata to the database:', error);
    return NextResponse.json({ error: 'Error uploading files or saving data to the database.' }, { status: 500 });
  }
}
interface AddToWatchlistData {
  filmId: number;
  pathname: string;
}

interface DeleteFromWatchlistData {
  watchlistId: string;
}

interface UserRatingData {
  userId: string;  // Assuming user ID is a string
  filmId: number;
  rating: number;  // User's rating
}

interface AverageRatingResponse {
  averageRating: number;
}



// Function to add a movie to the watchlist
export const addToWatchlist = async (data: AddToWatchlistData) => {
  try {
    const response = await axios.post('/api/watchlist/add', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to delete a film from the watchlist
export const deleteFromWatchlist = async (data: DeleteFromWatchlistData) => {
  try {
    const response = await axios.post('/api/watchlist/delete', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to save/update a user's rating for a film
export const saveUserRating = async (data: UserRatingData) => {
  try {
    const response = await axios.post(
      `/api/films/${data.filmId}/user-rating`,
      {
        userId: data.userId,
        rating: data.rating,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to fetch the average rating of a film
export const fetchAverageRating = async (filmId: number) => {
  try {
    const response = await axios.get(`/api/films/${filmId}/average-rating`);
    return response.data as AverageRatingResponse; // Ensure we return the correct type
  } catch (error) {
    throw error;
  }
};
