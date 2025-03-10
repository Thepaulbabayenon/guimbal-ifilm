import { NextResponse, type NextRequest } from "next/server";
import { 
  getUserFromSession, 
  updateUserSessionExpiration, 
  Cookies
} from "@/app/auth/core/session";

interface User {
  id: string;
  role: string;
}

interface CachedSession {
  user: User | null;
  expiresAt: number;
  lastDatabaseUpdate: number;
}

// Authentication configuration
const AUTH_COOKIE_NAME = "session_token";

// Route configuration maps for faster lookups
const ROUTE_CONFIG = {
  private: new Set([
    "/home/user/favorites", 
    "/home/user", 
    "/home/user/recommended"
  ]),
  admin: new Set([
    "/admin", 
    "/admin/upload", 
    "/admin/delete", 
    "/admin/edit",
    "/admin/users",
    "/admin/user-edit",
  ]),
  // Static extensions to skip middleware for
  staticExtensions: new Set([
    '.ico', '.png', '.jpg', '.jpeg', '.svg', 
    '.css', '.js', '.woff', '.woff2', '.ttf'
  ])
};

// Performance optimization constants
const SESSION_CACHE_DURATION = 900000; // 15 minutes in milliseconds
const SESSION_UPDATE_INTERVAL = 3600000; // 1 hour in milliseconds
const MIN_DB_OPERATION_INTERVAL = 1000; // 1 second in milliseconds
const GRACE_PERIOD = 60000; // 1 minute in milliseconds

// Memory-efficient session cache
const userSessionCache = new Map<string, CachedSession>();
let lastDbOperationTime = 0;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Fast path: Skip middleware for static resources and public routes
  if (shouldSkipMiddleware(pathname, request)) {
    return NextResponse.next();
  }

  // Cookie helper object - created only when needed
  const cookies: Cookies = {
    set: (key, value, options) => {
      request.cookies.set({ ...options, name: key, value });
      return Promise.resolve();
    },
    get: (key) => request.cookies.get(key),
    delete: (key) => request.cookies.delete(key)
  };

  const currentTime = Date.now();
  
  // Auth check and route protection
  const authResponse = await middlewareAuth(request, cookies, currentTime);
  if (authResponse) return authResponse;
  
  const response = NextResponse.next();
  
  // Session update logic - only for active sessions that need refreshing
  const sessionToken = cookies.get(AUTH_COOKIE_NAME)?.value;
  if (sessionToken) {
    const cachedSession = userSessionCache.get(sessionToken);
    
    if (
      cachedSession && 
      currentTime - cachedSession.lastDatabaseUpdate > SESSION_UPDATE_INTERVAL &&
      currentTime - lastDbOperationTime > MIN_DB_OPERATION_INTERVAL
    ) {
      lastDbOperationTime = currentTime;
      
      // Fire-and-forget session update
      queueMicrotask(async () => {
        try {
          await updateUserSessionExpiration(cookies);
          
          const session = userSessionCache.get(sessionToken);
          if (session) {
            userSessionCache.set(sessionToken, {
              ...session,
              lastDatabaseUpdate: Date.now()
            });
          }
        } catch (error) {
          console.error("Session update error:", error);
        }
      });
    }
  }
  
  return response;
}

async function middlewareAuth(request: NextRequest, cookies: Cookies, currentTime: number) {
  const sessionToken = cookies.get(AUTH_COOKIE_NAME)?.value;
  
  // Fast path for no token
  if (!sessionToken) {
    const { pathname } = request.nextUrl;
    // Check if route requires auth
    if (isProtectedRoute(pathname)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return null;
  }
  
  // User lookup with cache prioritization
  const cachedSession = userSessionCache.get(sessionToken);
  let user: User | null = null;
  
  if (cachedSession && currentTime < cachedSession.expiresAt) {
    // Cache hit - use cached user data
    user = cachedSession.user;
  } else {
    // Cache miss or expired cache
    if (currentTime - lastDbOperationTime > MIN_DB_OPERATION_INTERVAL) {
      // Database retrieval path
      lastDbOperationTime = currentTime;
      
      // Optimize cookie extraction
      const cookiesObject: Record<string, string> = {};
      for (const cookie of request.cookies.getAll()) {
        cookiesObject[cookie.name] = cookie.value;
      }
      
      try {
        user = await getUserFromSession(cookiesObject);
        
        // Update cache
        if (user) {
          userSessionCache.set(sessionToken, {
            user,
            expiresAt: currentTime + SESSION_CACHE_DURATION,
            lastDatabaseUpdate: currentTime
          });
        } else {
          // Invalid session - clean up
          userSessionCache.delete(sessionToken);
          cookies.delete(AUTH_COOKIE_NAME);
        }
      } catch (error) {
        console.error("Session retrieval error:", error);
        // Fallback to cached data if available during errors
        if (cachedSession) user = cachedSession.user;
      }
    } else if (cachedSession) {
      // Throttling active - use slightly expired cache with grace period
      user = cachedSession.user;
      userSessionCache.set(sessionToken, {
        ...cachedSession,
        expiresAt: currentTime + GRACE_PERIOD
      });
    }
  }

  // Route authorization checks
  const { pathname } = request.nextUrl;
  
  // Private route check
  for (const route of ROUTE_CONFIG.private) {
    if (pathname.startsWith(route)) {
      if (!user) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
      break;
    }
  }

  // Admin route check
  for (const route of ROUTE_CONFIG.admin) {
    if (pathname.startsWith(route)) {
      if (!user) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
      
      if (user.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      break;
    }
  }
  
  return null;
}

// Optimized helper functions
function shouldSkipMiddleware(pathname: string, request: NextRequest): boolean {
  // Check static path components first (most common case)
  if (
    pathname.includes('/_next') || 
    pathname.includes('/api/public') ||
    pathname.includes('/static/')
  ) {
    return true;
  }
  
  // Check file extensions
  const lastDotIndex = pathname.lastIndexOf('.');
  if (lastDotIndex !== -1) {
    const extension = pathname.slice(lastDotIndex);
    if (ROUTE_CONFIG.staticExtensions.has(extension)) {
      return true;
    }
  }
  
  // Special case for homepage without auth
  return pathname === '/' && !request.cookies.has(AUTH_COOKIE_NAME);
}

function isProtectedRoute(pathname: string): boolean {
  // Check private routes
  for (const route of ROUTE_CONFIG.private) {
    if (pathname.startsWith(route)) return true;
  }
  
  // Check admin routes
  for (const route of ROUTE_CONFIG.admin) {
    if (pathname.startsWith(route)) return true;
  }
  
  return false;
}

// Focused matcher pattern
export const config = {
  matcher: [
    '/home/:path*',
    '/admin/:path*',
    '/api/((?!public).)*',
    '/sign-in',
    '/sign-up'
  ],
};