// File: app/api/auth/token/route.ts
export const dynamic = "force-dynamic"; // Forces the API to run on every request

import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { getUserFromSession } from '@/app/auth/core/session';

/**
 * GET /api/auth/token
 * 
 * Returns a JWT token for the authenticated user based on their session
 * The token can be used for API requests that require authentication
 */
export async function GET(req: NextRequest) {
  try {
    // Get cookies from the request
    const cookiesObj: Record<string, string> = {};
    req.cookies.getAll().forEach(cookie => {
      cookiesObj[cookie.name] = cookie.value;
    });

    // Get the user from the session
    const user = await getUserFromSession(cookiesObj);

    // If user is not authenticated, return 401
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - You must be signed in to access this endpoint" },
        { status: 401 }
      );
    }

    // Additional user data may need to be fetched from your database
    // to include 2FA status in the token
    // This is a simplified example based on available session data
    
    // Create a JWT token with essential user information
    const token = sign(
      {
        id: user.id,
        role: user.role,
        // Include other fields that might be needed by client applications
        // Note: You might need to extend this with 2FA status if needed
      },
      process.env.JWT_SECRET || "fallback-secret-change-me-in-production",
      { 
        expiresIn: "1h" // Token expires in 1 hour
      }
    );

    // Return the token in the response
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}