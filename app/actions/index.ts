// /actions/index.ts
'use server';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db/drizzle'; // Adjust the import to match your NeonDB setup
import { film } from '@/app/db/schema'; // Adjust import for your films table schema
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { resetTokens } from "@/app/db/schema"
import crypto from "crypto"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)





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


export async function sendPasswordReset(email: string) {
  try {
    // Generate a secure reset token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // Token valid for 1 hour

    // Store reset token in DB
    await db.insert(resetTokens).values({ email, token, expiresAt })

    // Generate reset link
    const resetLink = `https://thebantayanfilmfestival.com/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    // Send email
    await resend.emails.send({
      from: "noreply@thebantayanfilmfestival.com",
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link is valid for 1 hour.</p>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return { success: false, error: "Failed to send reset email" }
  }
}