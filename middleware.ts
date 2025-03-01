import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define matchers for protected and public routes
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isPublicRoute = createRouteMatcher(["/", "/home", "/home/recently", "/home/films", "/home/announcements"]); // Add public routes here

export default clerkMiddleware(async (auth, req) => {
  // Skip authentication for public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect admin routes and check if the user is an admin
  if (isAdminRoute(req) && (await auth()).sessionClaims?.metadata?.role !== "admin") {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    // Exclude known static routes from middleware
    "/((?!_next|.*\\.(?:html?|css|js|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    
    // Always run for API routes (authentication-sensitive)
    "/(api|trpc)(.*)",
    "/api/webhooks(.*)",
    "/api/(.*)",

    // Only apply to authenticated routes (excluding statically generated pages)
    "/admin(.*)",
  ],
};

