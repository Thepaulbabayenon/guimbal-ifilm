export const dynamic = "force-dynamic"; // Forces the API to run on every request

import { NextRequest, NextResponse } from "next/server";
import { redisClient } from "@/redis/redis";
import { CookiesHandler, COOKIE_SESSION_KEY } from "@/app/auth/core/session";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("Signout request received");

    // Initialize response
    const response = new NextResponse(JSON.stringify({ message: "Signed out successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // Initialize cookie handler
    const cookiesHandler = new CookiesHandler(req, response);
    const sessionCookie = cookiesHandler.get(COOKIE_SESSION_KEY);

    if (!sessionCookie || !sessionCookie.value) {
      console.log("No session ID found in cookies");
      return response;
    }

    const sessionId = sessionCookie.value;
    console.log(`Removing session for session ID: ${sessionId}`);

    // Delete session from Redis and remove cookie
    await redisClient.del(`session:${sessionId}`);
    cookiesHandler.delete(COOKIE_SESSION_KEY);

    console.log("User successfully signed out");
    return response;
  } catch (error) {
    console.error("Signout error:", error);
    return new NextResponse(JSON.stringify({ error: "Sign-out failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

