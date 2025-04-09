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
  deviceType?: string; // Track whether session is from mobile or desktop
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

// Rate Limiting Configuration - Adjusted for mobile
const RATE_LIMIT_CONFIG = {
  // Different limits for desktop vs mobile
  MAX_REQUESTS: {
    DESKTOP: 100,
    MOBILE: 150, // Higher limit for mobile to account for multiple connection attempts
  },
  // Time window in milliseconds (1 minute)
  TIME_WINDOW: 60000,
  // Sliding window for more precise rate limiting
  SLIDING_WINDOW_SEGMENTS: 6,
  // Block duration for IP after rate limit exceeded
  BLOCK_DURATION: 300000, // 5 minutes
};

// Session and Caching Constants - Optimized for mobile
const SESSION_CACHE_DURATION = {
  DESKTOP: 900000,  // 15 minutes
  MOBILE: 1800000,  // 30 minutes for mobile to reduce refreshes
};
const SESSION_UPDATE_INTERVAL = 3600000; // 1 hour
const MIN_DB_OPERATION_INTERVAL = {
  DESKTOP: 1000,    // 1 second
  MOBILE: 5000,     // 5 seconds for mobile to reduce load
};
const GRACE_PERIOD = 300000; // Extended to 5 minutes

// Caches
const userSessionCache = new Map<string, CachedSession>();
const rateLimitCache = new Map<string, RateLimitEntry>();
const blockedIPs = new Set<string>();

// Debugging flag - Consider disabling in production
const DEBUG = false;

// Debug logging function
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[Auth Middleware]", ...args);
  }
}

// Per-device DB operation tracking
const lastDbOperationTime = {
  global: 0,
  byDevice: new Map<string, number>()
};

// Device detection
function detectDeviceType(request: NextRequest): 'MOBILE' | 'DESKTOP' {
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent);
  return isMobile ? 'MOBILE' : 'DESKTOP';
}

// Get client IP address with better fallbacks
function getClientIP(request: NextRequest): string {
  // Try multiple header sources
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'true-client-ip'
  ];
  
  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // Take first IP in case of comma-separated list
      return value.split(',')[0].trim();
    }
  }
  
  return 'unknown';
}

// Rate limit checker with device-specific configuration
function checkRateLimit(ip: string, deviceType: 'MOBILE' | 'DESKTOP', currentTime: number): boolean {
  // Skip rate limiting for known good IPs (could be expanded)
  if (ip === '127.0.0.1' || ip === 'localhost') {
    return true;
  }

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

  // Use device-specific rate limits
  const maxRequests = RATE_LIMIT_CONFIG.MAX_REQUESTS[deviceType];

  // Check if rate limit exceeded
  if (entry.count > maxRequests) {
    // Block IP
    blockedIPs.add(ip);
    
    // Schedule IP unblock
    setTimeout(() => {
      blockedIPs.delete(ip);
      rateLimitCache.delete(ip);
    }, RATE_LIMIT_CONFIG.BLOCK_DURATION);

    debugLog(`Rate limit exceeded for IP: ${ip} (${deviceType})`);
    return false;
  }

  return true;
}

// Improved middleware authentication function
async function middlewareAuth(request: NextRequest, cookies: Cookies, currentTime: number, deviceType: 'MOBILE' | 'DESKTOP') {
  const sessionToken = cookies.get(AUTH_COOKIE_NAME)?.value;
  const pathname = request.nextUrl.pathname;
  
  debugLog(`Auth check for ${pathname} - Token exists: ${!!sessionToken} - Device: ${deviceType}`);
  
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
  
  // Use device-specific cache duration
  const cacheDuration = SESSION_CACHE_DURATION[deviceType];
  
  if (cachedSession && currentTime < cachedSession.expiresAt) {
    // Cache hit - use cached user data
    user = cachedSession.user;
    debugLog(`Using cached user data for ${deviceType}: ${JSON.stringify(user)}`);
    
    // Update device type if it changed
    if (cachedSession.deviceType !== deviceType) {
      userSessionCache.set(sessionToken, {
        ...cachedSession,
        deviceType
      });
    }
  } else {
    // Cache miss or expired cache
    const deviceKey = `${deviceType}-${sessionToken.substring(0,8)}`;
    const lastDeviceDbTime = lastDbOperationTime.byDevice.get(deviceKey) || 0;
    const dbThrottleInterval = MIN_DB_OPERATION_INTERVAL[deviceType];
    
    const shouldQueryDb = currentTime - lastDeviceDbTime > dbThrottleInterval &&
                          currentTime - lastDbOperationTime.global > MIN_DB_OPERATION_INTERVAL.DESKTOP;
    
    if (shouldQueryDb) {
      // Database retrieval path
      lastDbOperationTime.global = currentTime;
      lastDbOperationTime.byDevice.set(deviceKey, currentTime);
      
      // Optimize cookie extraction
      const cookiesObject: Record<string, string> = {};
      for (const cookie of request.cookies.getAll()) {
        cookiesObject[cookie.name] = cookie.value;
      }
      
      try {
        debugLog(`Retrieving user from database for token: ${sessionToken.substring(0, 10)}... (${deviceType})`);
        user = await getUserFromSession(cookiesObject);
        debugLog(`User from database: ${JSON.stringify(user)}`);
        
        // Update cache
        if (user) {
          userSessionCache.set(sessionToken, {
            user,
            expiresAt: currentTime + cacheDuration,
            lastDatabaseUpdate: currentTime,
            deviceType
          });
          debugLog(`Updated user cache for: ${user.id} (${deviceType})`);
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
      debugLog(`Using expired cache with grace period (${deviceType}): ${JSON.stringify(user)}`);
      userSessionCache.set(sessionToken, {
        ...cachedSession,
        expiresAt: currentTime + GRACE_PERIOD,
        deviceType
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

// Middleware skip check - optimized for performance
function shouldSkipMiddleware(pathname: string, request: NextRequest): boolean {
  // Fast-path static checks first
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api/public') ||
      pathname.startsWith('/static/')) {
    return true;
  }
  
  // Check file extensions
  const lastDotIndex = pathname.lastIndexOf('.');
  if (lastDotIndex !== -1 && lastDotIndex > pathname.lastIndexOf('/')) {
    const extension = pathname.slice(lastDotIndex);
    if (ROUTE_CONFIG.staticExtensions.has(extension)) {
      return true;
    }
  }
  
  // Special case for homepage without auth
  return pathname === '/' && !request.cookies.has(AUTH_COOKIE_NAME);
}

// Protected route check - optimized
function isProtectedRoute(pathname: string): boolean {
  // Quick check for admin routes
  return pathname.startsWith('/admin');
}

// Main middleware function - optimized for mobile
export async function middleware(request: NextRequest) {
  const currentTime = Date.now();
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static assets and non-protected routes
  if (shouldSkipMiddleware(pathname, request)) {
    return NextResponse.next();
  }
  
  // Detect device type first
  const deviceType = detectDeviceType(request);
  const clientIP = getClientIP(request);

  // Early rate limit check with device-specific settings
  if (!checkRateLimit(clientIP, deviceType, currentTime)) {
    return new NextResponse(null, {
      status: 429, // Too Many Requests
      headers: {
        'Content-Type': 'text/plain',
        'Retry-After': Math.ceil(RATE_LIMIT_CONFIG.BLOCK_DURATION / 1000).toString()
      }
    });
  }

  debugLog(`Processing ${deviceType} request for: ${pathname}`);

  // Cookie helper object
  const cookies: Cookies = {
    set: (key, value, options) => {
      request.cookies.set({ ...options, name: key, value });
      return Promise.resolve();
    },
    get: (key) => request.cookies.get(key),
    delete: (key) => request.cookies.delete(key)
  };
  
  // Auth check and route protection
  const authResponse = await middlewareAuth(request, cookies, currentTime, deviceType);
  if (authResponse) return authResponse;
  
  const response = NextResponse.next();
  
  // Session update logic - optimized to reduce refreshes on mobile
  const sessionToken = cookies.get(AUTH_COOKIE_NAME)?.value;
  if (sessionToken) {
    const cachedSession = userSessionCache.get(sessionToken);
    
    // Only update if it's been a long time since the last update
    // Use longer interval for mobile devices
    const updateInterval = deviceType === 'MOBILE' ? 
      SESSION_UPDATE_INTERVAL * 2 : SESSION_UPDATE_INTERVAL;
    
    if (
      cachedSession && 
      currentTime - cachedSession.lastDatabaseUpdate > updateInterval &&
      currentTime - lastDbOperationTime.global > MIN_DB_OPERATION_INTERVAL[deviceType]
    ) {
      const deviceKey = `${deviceType}-${sessionToken.substring(0,8)}`;
      lastDbOperationTime.global = currentTime;
      lastDbOperationTime.byDevice.set(deviceKey, currentTime);
      
      // For mobile, make this less aggressive by using background update
      if (deviceType === 'MOBILE') {
        // Fire-and-forget session update
        queueMicrotask(async () => {
          try {
            await updateUserSessionExpiration(cookies);
            
            const session = userSessionCache.get(sessionToken);
            if (session) {
              userSessionCache.set(sessionToken, {
                ...session,
                lastDatabaseUpdate: Date.now(),
                deviceType
              });
            }
          } catch (error) {
            debugLog("Session update error:", error);
          }
        });
      } else {
        // For desktop, update immediately
        updateUserSessionExpiration(cookies).then(() => {
          const session = userSessionCache.get(sessionToken);
          if (session) {
            userSessionCache.set(sessionToken, {
              ...session,
              lastDatabaseUpdate: Date.now(),
              deviceType
            });
          }
        }).catch(error => {
          debugLog("Session update error:", error);
        });
      }
    }
  }
  
  return response;
}

// Matcher configuration - unchanged
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/((?!public).)*',
    '/sign-in',
    '/sign-up'
  ],
};