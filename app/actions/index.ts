'use server';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle';
import { film, resetTokens } from '@/app/db/schema';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from "crypto";
import { Resend } from "resend";
import { eq, } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.thebantayanfilmfestival.com';

// Initialize S3 client from AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface AddToWatchlistData {
  filmId: number;
  pathname: string;
}

interface DeleteFromWatchlistData {
  watchlistId: string;
}

interface UserRatingData {
  userId: string;
  filmId: number;
  rating: number;
}

interface AverageRatingResponse {
  averageRating: number;
}

// For NextRequest/NextResponse usage
export async function handleApiRequest(req: NextRequest) {
  const body = await req.json();
  
  if (req.method === 'POST') {
    
    return NextResponse.json({ success: true, data: body });
  } else {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }
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
    return response.data as AverageRatingResponse;
  } catch (error) {
    throw error;
  }
};

// Using the film schema to get film details
export async function getFilmDetails(filmId: number) {
  try {
    const filmData = await db.select().from(film).where(eq(film.id, filmId));
    return filmData[0] || null;
  } catch (error) {
    console.error("Error fetching film details:", error);
    return null;
  }
}

// Generate a signed URL for uploading film posters to S3
export async function generateUploadUrl(fileName: string, userId: string) {
  try {
    const key = `posters/${userId}/${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: 'image/jpeg', // Adjust based on your requirements
    });
    
    // Generate a signed URL that allows the client to upload directly to S3
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    return {
      success: true,
      uploadUrl: signedUrl,
      fileKey: key
    };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return { success: false, error: "Failed to generate upload URL" };
  }
}

export async function sendPasswordReset(email: string) {
  try {
   
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); 

  
    await db.insert(resetTokens).values({ email, token, expiresAt });

    
    const resetLink = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

   
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link is valid for 1 hour.</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: "Failed to send reset email" };
  }
}