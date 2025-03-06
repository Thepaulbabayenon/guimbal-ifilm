import { NextResponse, type NextRequest } from "next/server";
import { getUserFromSession, updateUserSessionExpiration, Cookies } from "@/app/auth/core/session";

// Define the type for the user
interface User {
  id: string;
  role: string;
  // Add any other properties relevant to your user
}

// Define private and admin routes
const privateRoutes = [
  "/home/user/favorites", 
  "/home/user", 
  "/home/user/recommended"
];

const adminRoutes = [
  "/admin", 
  "/admin/upload", 
  "/admin/delete", 
  "/admin/edit",
  "/admin/users",
  "/admin/user-edit",
];

// Define the cookies object with the correct types for set, get, and delete
export async function middleware(request: NextRequest) {
  console.log("Middleware triggered for:", request.nextUrl.pathname);

  const cookies: Cookies = {
    set: (key: string, value: string, options: { 
      secure?: boolean; 
      httpOnly?: boolean; 
      sameSite?: "strict" | "lax"; 
      expires?: number 
    }) => {
      console.log(`Setting cookie: ${key} = ${value}`);
      request.cookies.set({ ...options, name: key, value });
      return Promise.resolve(); 
    },
    get: (key: string) => {
      console.log(`Getting cookie: ${key}`);
      return request.cookies.get(key);
    },
    delete: (key: string) => {
      console.log(`Deleting cookie: ${key}`);
      return request.cookies.delete(key);
    },
  };

  const response = (await middlewareAuth(request, cookies)) ?? NextResponse.next();
  
  // Only update session expiration if a response was successfully generated
  if (response) {
    await updateUserSessionExpiration(cookies);
  }

  console.log("Middleware completed for:", request.nextUrl.pathname);
  return response;
}

// Function to handle authentication logic
async function middlewareAuth(request: NextRequest, cookies: Cookies) {
  console.log("Checking authentication for:", request.nextUrl.pathname);

  // Convert cookies to an object for getUserFromSession
  const cookiesObject: { [key: string]: string } = {};
  const allCookies = request.cookies.getAll();
  allCookies.forEach((cookie: { name: string, value: string }) => {
    cookiesObject[cookie.name] = cookie.value;
    console.log(`Cookie found: ${cookie.name} = ${cookie.value}`);
  });

  // Get user from session
  const user: User | null = await getUserFromSession(cookiesObject);
  console.log("User from session:", user);

  // Check for private routes authentication
  if (privateRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!isUserAuthenticated(user)) {
      console.log("User not authenticated for private route, redirecting to /sign-in");
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // Check for admin routes authentication
  if (adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    console.log("Attempting to access admin route");
    
    // First, check if user is authenticated
    if (!isUserAuthenticated(user)) {
      console.log("User not authenticated, redirecting to /sign-in");
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    
    // Then, check if user is an admin
    console.log("User role:", user?.role);
    if (!isUserAdmin(user)) {
      console.log("User is not an admin, redirecting to /");
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Optional: Additional logic for cleaning up or managing cookies
  if (shouldDeleteCookie(user)) {
    cookies.delete("__clerk_db_jwt");
  }

  console.log("Authentication check passed");
  return null; // Allow the request to proceed
}

// Helper functions
const isUserAuthenticated = (user: User | null) => !!user;
const isUserAdmin = (user: User | null) => user && user.role === "admin";
const shouldDeleteCookie = (user: User | null) => !user;

// Configure matcher for middleware
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};