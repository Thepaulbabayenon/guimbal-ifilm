export const dynamic = "force-dynamic"; // Forces the API to run on every request

import { NextRequest, NextResponse } from "next/server";
import { CookiesHandler, removeUserFromSession } from "@/app/auth/core/session";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("Signout request received");

  
    const response = new NextResponse(JSON.stringify({ message: "Signed out successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

   
    const cookiesHandler = new CookiesHandler(req, response);

   
    await removeUserFromSession(cookiesHandler);
    
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