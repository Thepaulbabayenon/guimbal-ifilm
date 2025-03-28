import { NextResponse, type NextRequest } from "next/server";
import { 
  getUserFromSession, 
  updateUserSessionExpiration,
  COOKIE_SESSION_KEY,
  Cookies
} from "@/app/auth/core/session";

// User and Session Interfaces
interface User {
  id: string;
  role: string;
}

interface CachedSession {
  user: User | null;
  expiresAt: number;
  lastDatabaseUpdate: number;
}

interface RateLimitEntry {
  count: number;
  lastResetTime: number;
}

// Constants
const AUTH_COOKIE_NAME = COOKIE_SESSION_KEY;

const ROUTE_CONFIG = {
  admin: new Set([
    "/admin", 
    "/admin/upload", 
    "/admin/delete", 
    "/admin/edit",
    "/admin/users",
    "/admin/user-edit",
  ]),

  staticExtensions: new Set([
    '.ico', '.png', '.jpg', '.jpeg', '.svg', 
    '.css', '.js', '.woff', '.woff2', '.ttf'
  ])
};

// Rate Limiting Configuration
const RATE_LIMIT_CONFIG = {
  // Maximum number of requests per time window
  MAX_REQUESTS: 100,
  // Time window in milliseconds (1 minute)
  TIME_WINDOW: 60000,
  // Sliding window for more precise rate limiting
  SLIDING_WINDOW_SEGMENTS: 6,
  // Block duration for IP after rate limit exceeded
  BLOCK_DURATION: 300000, // 5 minutes
};

// Session and Caching Constants
const SESSION_CACHE_DURATION = 900000;  // 15 minutes 
const SESSION_UPDATE_INTERVAL = 3600000; // 1 hour
const MIN_DB_OPERATION_INTERVAL = 1000; 
const GRACE_PERIOD = 60000; 

// Caches
const userSessionCache = new Map<string, CachedSession>();
const rateLimitCache = new Map<string, RateLimitEntry>();
const blockedIPs = new Set<string>();

// Debugging flag
const DEBUG = true;

// Debug logging function
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[Auth Middleware]", ...args);
  }
}

// Track last database operation time
let lastDbOperationTime = 0;

// Get client IP address
function getClientIP(request: NextRequest): string {
  // Attempt to get IP from various sources
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  // Prefer x-forwarded-for, then x-real-ip, fallback to unknown
  return (forwardedFor?.split(',')[0] || realIP || 'unknown').trim();
}

// Rate limit checker
function checkRateLimit(ip: string, currentTime: number): boolean {
  // Check if IP is permanently blocked
  if (blockedIPs.has(ip)) {
    debugLog(`Blocked IP attempt: ${ip}`);
    return false;
  }

  // Retrieve or initialize rate limit entry
  const entry = rateLimitCache.get(ip) || { 
    count: 0, 
    lastResetTime: currentTime 
  };

  // Calculate sliding window segments
  const segmentDuration = RATE_LIMIT_CONFIG.TIME_WINDOW / RATE_LIMIT_CONFIG.SLIDING_WINDOW_SEGMENTS;
  const currentSegment = Math.floor((currentTime - entry.lastResetTime) / segmentDuration);

  // Reset count if time window has passed
  if (currentTime - entry.lastResetTime >= RATE_LIMIT_CONFIG.TIME_WINDOW) {
    entry.count = 0;
    entry.lastResetTime = currentTime;
  }

  // Increment request count
  entry.count++;

  // Update cache
  rateLimitCache.set(ip, entry);

  // Check if rate limit exceeded
  if (entry.count > RATE_LIMIT_CONFIG.MAX_REQUESTS) {
    // Block IP
    blockedIPs.add(ip);
    
    // Schedule IP unblock
    setTimeout(() => {
      blockedIPs.delete(ip);
      rateLimitCache.delete(ip);
    }, RATE_LIMIT_CONFIG.BLOCK_DURATION);

    debugLog(`Rate limit exceeded for IP: ${ip}`);
    return false;
  }

  return true;
}

// Middleware authentication function
async function middlewareAuth(request: NextRequest, cookies: Cookies, currentTime: number) {
  const sessionToken = cookies.get(AUTH_COOKIE_NAME)?.value;
  const pathname = request.nextUrl.pathname;
  
  debugLog(`Auth check for ${pathname} - Token exists: ${!!sessionToken}`);
  
  // Fast path for no token
  if (!sessionToken) {
    // Check if route requires auth
    if (isProtectedRoute(pathname)) {
      debugLog(`No auth token, redirecting from protected route: ${pathname}`);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return null;
  }
  
  // User lookup with cache prioritization
  const cachedSession = userSessionCache.get(sessionToken);
  debugLog(`Cache status for ${pathname}: ${cachedSession ? 'HIT' : 'MISS'}`);
  
  let user: User | null = null;
  
  if (cachedSession && currentTime < cachedSession.expiresAt) {
    // Cache hit - use cached user data
    user = cachedSession.user;
    debugLog(`Using cached user data: ${JSON.stringify(user)}`);
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
        debugLog(`Retrieving user from database for token: ${sessionToken.substring(0, 10)}...`);
        user = await getUserFromSession(cookiesObject);
        debugLog(`User from database: ${JSON.stringify(user)}`);
        
        // Update cache
        if (user) {
          userSessionCache.set(sessionToken, {
            user,
            expiresAt: currentTime + SESSION_CACHE_DURATION,
            lastDatabaseUpdate: currentTime
          });
          debugLog(`Updated user cache for: ${user.id}`);
        } else {
          // Invalid session - clean up
          debugLog(`Invalid session, clearing token: ${sessionToken.substring(0, 10)}...`);
          userSessionCache.delete(sessionToken);
          cookies.delete(AUTH_COOKIE_NAME);
        }
      } catch (error) {
        debugLog("Session retrieval error:", error);
        // Fallback to cached data if available during errors
        if (cachedSession) {
          user = cachedSession.user;
          debugLog(`Falling back to cached user during error: ${JSON.stringify(user)}`);
        }
      }
    } else if (cachedSession) {
      // Throttling active - use slightly expired cache with grace period
      user = cachedSession.user;
      debugLog(`Using expired cache with grace period: ${JSON.stringify(user)}`);
      userSessionCache.set(sessionToken, {
        ...cachedSession,
        expiresAt: currentTime + GRACE_PERIOD
      });
    }
  }

  // Admin route check
  for (const route of ROUTE_CONFIG.admin) {
    if (pathname.startsWith(route)) {
      if (!user) {
        debugLog(`No user found for admin route ${pathname}, redirecting to sign-in`);
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
      
      if (user.role !== "admin") {
        debugLog(`User ${user.id} with role ${user.role} not authorized for admin route: ${pathname}`);
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      debugLog(`Admin ${user.id} authorized for admin route: ${pathname}`);
      break;
    }
  }
  
  return null;
}

// Middleware skip check
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

// Protected route check
function isProtectedRoute(pathname: string): boolean {
  // Check admin routes only
  for (const route of ROUTE_CONFIG.admin) {
    if (pathname.startsWith(route)) return true;
  }
  
  return false;
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const currentTime = Date.now();
  const pathname = request.nextUrl.pathname;
  const clientIP = getClientIP(request);

  // Early rate limit check
  if (!checkRateLimit(clientIP, currentTime)) {
    return new NextResponse(null, {
      status: 429, // Too Many Requests
      headers: {
        'Content-Type': 'text/plain',
        'Retry-After': Math.ceil(RATE_LIMIT_CONFIG.BLOCK_DURATION / 1000).toString()
      }
    });
  }
  
  if (shouldSkipMiddleware(pathname, request)) {
    return NextResponse.next();
  }

  debugLog(`Processing request for: ${pathname}`);

  // Cookie helper object - created only when needed
  const cookies: Cookies = {
    set: (key, value, options) => {
      request.cookies.set({ ...options, name: key, value });
      return Promise.resolve();
    },
    get: (key) => request.cookies.get(key),
    delete: (key) => request.cookies.delete(key)
  };

  // Check for auth cookie first - early exit if missing and debug
  const authCookie = cookies.get(AUTH_COOKIE_NAME);
  if (!authCookie) {
    debugLog(`No auth cookie found for ${pathname}`);
  } else {
    debugLog(`Auth cookie found: ${authCookie.name}=${authCookie.value.substring(0, 10)}...`);
  }
  
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
          debugLog("Session update error:", error);
        }
      });
    }
  }
  
  return response;
}

// Matcher configuration
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/((?!public).)*',
    '/sign-in',
    '/sign-up'
  ],
};