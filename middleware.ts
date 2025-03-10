import { NextResponse, type NextRequest } from "next/server";
import { 
  getUserFromSession, 
  updateUserSessionExpiration, 
  Cookies,
  cleanupExpiredSessions
} from "@/app/auth/core/session";

interface User {
  id: string;
  role: string;
}

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

// Cache for user sessions to reduce database queries
const userSessionCache = new Map<string, {user: User | null, expiresAt: number}>();
const SESSION_CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// Cleanup interval increased to reduce database operations
let lastCleanupTime = 0;
const CLEANUP_INTERVAL = 1000 * 60 * 60 * 24; // Increased to 24 hours

// Session update throttling - only update if nearing expiration
const SESSION_UPDATE_THRESHOLD = 1000 * 60 * 30; // 30 minutes before expiration

export async function middleware(request: NextRequest) {
  // Skip middleware for static assets and non-authenticated routes
  const pathname = request.nextUrl.pathname;
  if (
    pathname.includes('/_next') || 
    pathname.includes('/api/public') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    (pathname === '/' && !request.cookies.has('__clerk_db_jwt'))
  ) {
    return NextResponse.next();
  }

  const cookies: Cookies = {
    set: (key: string, value: string, options: { 
      secure?: boolean; 
      httpOnly?: boolean; 
      sameSite?: "strict" | "lax"; 
      expires?: number 
    }) => {
      request.cookies.set({ ...options, name: key, value });
      return Promise.resolve(); 
    },
    get: (key: string) => {
      return request.cookies.get(key);
    },
    delete: (key: string) => {
      return request.cookies.delete(key);
    },
  };

  // Run cleanup less frequently
  const currentTime = Date.now();
  if (currentTime - lastCleanupTime > CLEANUP_INTERVAL) {
    try {
      // Run cleanup as a non-blocking operation
      cleanupExpiredSessions().then(deletedCount => {
        console.log(`Cleaned up ${deletedCount} expired sessions`);
      }).catch(error => {
        console.error("Session cleanup error:", error);
      });
      
      lastCleanupTime = currentTime;
    } catch (error) {
      console.error("Error initiating session cleanup:", error);
    }
  }

  const response = (await middlewareAuth(request, cookies)) ?? NextResponse.next();
  
  // Only update session expiration if necessary
  // Note: this assumes session metadata includes expiration info
  const sessionCookie = cookies.get("__clerk_db_jwt");
  if (response && sessionCookie) {
    const sessionToken = sessionCookie.value;
    const cachedSession = userSessionCache.get(sessionToken);
    
    // Only update if nearing expiration or not cached
    if (!cachedSession || (cachedSession.expiresAt - currentTime) < SESSION_UPDATE_THRESHOLD) {
      await updateUserSessionExpiration(cookies);
    }
  }
 
  return response;
}

async function middlewareAuth(request: NextRequest, cookies: Cookies) {
  const sessionToken = cookies.get("__clerk_db_jwt")?.value;
  
  // Skip auth check if no session token exists
  if (!sessionToken) {
    if (isProtectedRoute(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return null;
  }
  
  // Check cache before hitting database
  const currentTime = Date.now();
  const cachedSession = userSessionCache.get(sessionToken);
  
  let user: User | null = null;
  
  if (cachedSession && currentTime < cachedSession.expiresAt) {
    user = cachedSession.user;
  } else {
    // Convert cookies to an object for getUserFromSession
    const cookiesObject: { [key: string]: string } = {};
    const allCookies = request.cookies.getAll();
    allCookies.forEach((cookie: { name: string, value: string }) => {
      cookiesObject[cookie.name] = cookie.value;
    });
    
    user = await getUserFromSession(cookiesObject);
    
    // Cache the result
    if (user) {
      userSessionCache.set(sessionToken, {
        user,
        expiresAt: currentTime + SESSION_CACHE_DURATION
      });
    } else if (sessionToken) {
      // If no user found but token exists, remove from cache
      userSessionCache.delete(sessionToken);
    }
  }

  const pathname = request.nextUrl.pathname;

  if (privateRoutes.some(route => pathname.startsWith(route))) {
    if (!isUserAuthenticated(user)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!isUserAuthenticated(user)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    
    if (!isUserAdmin(user)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  
  return null;
}

const isUserAuthenticated = (user: User | null) => !!user;
const isUserAdmin = (user: User | null) => user && user.role === "admin";
const shouldDeleteCookie = (user: User | null) => !user;
const isProtectedRoute = (pathname: string) => 
  privateRoutes.some(route => pathname.startsWith(route)) || 
  adminRoutes.some(route => pathname.startsWith(route));

// More specific matcher to reduce middleware execution
export const config = {
  matcher: [
    '/home/:path*',
    '/admin/:path*',
    '/api/:path*',
    '/sign-in', 
    '/sign-up'
  ],
};