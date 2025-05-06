import { NextResponse, type NextRequest } from "next/server";
import { 
  getUserFromSession, 
  updateUserSessionExpiration,
  COOKIE_SESSION_KEY,
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
  deviceType?: string;
}

interface RateLimitEntry {
  count: number;
  lastResetTime: number;
}

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

const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS: {
    DESKTOP: 100,
    MOBILE: 150,
  },
  TIME_WINDOW: 60000,
  SLIDING_WINDOW_SEGMENTS: 6,
  BLOCK_DURATION: 300000,
};

const SESSION_CACHE_DURATION = {
  DESKTOP: 900000,
  MOBILE: 1800000,
};
const SESSION_UPDATE_INTERVAL = 3600000;
const MIN_DB_OPERATION_INTERVAL = {
  DESKTOP: 1000,
  MOBILE: 5000,
};
const GRACE_PERIOD = 300000;

const userSessionCache = new Map<string, CachedSession>();
const rateLimitCache = new Map<string, RateLimitEntry>();
const blockedIPs = new Set<string>();

const DEBUG = false;

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[Auth Middleware]", ...args);
  }
}

const lastDbOperationTime = {
  global: 0,
  byDevice: new Map<string, number>()
};

function detectDeviceType(request: NextRequest): 'MOBILE' | 'DESKTOP' {
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent);
  return isMobile ? 'MOBILE' : 'DESKTOP';
}

function getClientIP(request: NextRequest): string {
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'true-client-ip'
  ];
  
  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      return value.split(',')[0].trim();
    }
  }
  
  return 'unknown';
}

function checkRateLimit(ip: string, deviceType: 'MOBILE' | 'DESKTOP', currentTime: number): boolean {
  if (ip === '127.0.0.1' || ip === 'localhost') {
    return true;
  }

  if (blockedIPs.has(ip)) {
    debugLog(`Blocked IP attempt: ${ip}`);
    return false;
  }

  const entry = rateLimitCache.get(ip) || { 
    count: 0, 
    lastResetTime: currentTime 
  };

  const segmentDuration = RATE_LIMIT_CONFIG.TIME_WINDOW / RATE_LIMIT_CONFIG.SLIDING_WINDOW_SEGMENTS;
  const currentSegment = Math.floor((currentTime - entry.lastResetTime) / segmentDuration);

  if (currentTime - entry.lastResetTime >= RATE_LIMIT_CONFIG.TIME_WINDOW) {
    entry.count = 0;
    entry.lastResetTime = currentTime;
  }

  entry.count++;

  rateLimitCache.set(ip, entry);

  const maxRequests = RATE_LIMIT_CONFIG.MAX_REQUESTS[deviceType];

  if (entry.count > maxRequests) {
    blockedIPs.add(ip);
    
    setTimeout(() => {
      blockedIPs.delete(ip);
      rateLimitCache.delete(ip);
    }, RATE_LIMIT_CONFIG.BLOCK_DURATION);

    debugLog(`Rate limit exceeded for IP: ${ip} (${deviceType})`);
    return false;
  }

  return true;
}

async function middlewareAuth(request: NextRequest, cookies: Cookies, currentTime: number, deviceType: 'MOBILE' | 'DESKTOP') {
  const sessionToken = cookies.get(AUTH_COOKIE_NAME)?.value;
  const pathname = request.nextUrl.pathname;
  
  debugLog(`Auth check for ${pathname} - Token exists: ${!!sessionToken} - Device: ${deviceType}`);
  
  if (!sessionToken) {
    if (isProtectedRoute(pathname)) {
      debugLog(`No auth token, redirecting from protected route: ${pathname}`);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return null;
  }
  
  const cachedSession = userSessionCache.get(sessionToken);
  debugLog(`Cache status for ${pathname}: ${cachedSession ? 'HIT' : 'MISS'}`);
  
  let user: User | null = null;
  
  const cacheDuration = SESSION_CACHE_DURATION[deviceType];
  
  if (cachedSession && currentTime < cachedSession.expiresAt) {
    user = cachedSession.user;
    debugLog(`Using cached user data for ${deviceType}: ${JSON.stringify(user)}`);
    
    if (cachedSession.deviceType !== deviceType) {
      userSessionCache.set(sessionToken, {
        ...cachedSession,
        deviceType
      });
    }
  } else {
    const deviceKey = `${deviceType}-${sessionToken.substring(0,8)}`;
    const lastDeviceDbTime = lastDbOperationTime.byDevice.get(deviceKey) || 0;
    const dbThrottleInterval = MIN_DB_OPERATION_INTERVAL[deviceType];
    
    const shouldQueryDb = currentTime - lastDeviceDbTime > dbThrottleInterval &&
                          currentTime - lastDbOperationTime.global > MIN_DB_OPERATION_INTERVAL.DESKTOP;
    
    if (shouldQueryDb) {
      lastDbOperationTime.global = currentTime;
      lastDbOperationTime.byDevice.set(deviceKey, currentTime);
      
      const cookiesObject: Record<string, string> = {};
      for (const cookie of request.cookies.getAll()) {
        cookiesObject[cookie.name] = cookie.value;
      }
      
      try {
        debugLog(`Retrieving user from database for token: ${sessionToken.substring(0, 10)}... (${deviceType})`);
        user = await getUserFromSession(cookiesObject);
        debugLog(`User from database: ${JSON.stringify(user)}`);
        
        if (user) {
          userSessionCache.set(sessionToken, {
            user,
            expiresAt: currentTime + cacheDuration,
            lastDatabaseUpdate: currentTime,
            deviceType
          });
          debugLog(`Updated user cache for: ${user.id} (${deviceType})`);
        } else {
          debugLog(`Invalid session, clearing token: ${sessionToken.substring(0, 10)}...`);
          userSessionCache.delete(sessionToken);
          cookies.delete(AUTH_COOKIE_NAME);
        }
      } catch (error) {
        debugLog("Session retrieval error:", error);
        if (cachedSession) {
          user = cachedSession.user;
          debugLog(`Falling back to cached user during error: ${JSON.stringify(user)}`);
        }
      }
    } else if (cachedSession) {
      user = cachedSession.user;
      debugLog(`Using expired cache with grace period (${deviceType}): ${JSON.stringify(user)}`);
      userSessionCache.set(sessionToken, {
        ...cachedSession,
        expiresAt: currentTime + GRACE_PERIOD,
        deviceType
      });
    }
  }

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

function shouldSkipMiddleware(pathname: string, request: NextRequest): boolean {
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api/public') ||
      pathname.startsWith('/static/')) {
    return true;
  }
  
  const lastDotIndex = pathname.lastIndexOf('.');
  if (lastDotIndex !== -1 && lastDotIndex > pathname.lastIndexOf('/')) {
    const extension = pathname.slice(lastDotIndex);
    if (ROUTE_CONFIG.staticExtensions.has(extension)) {
      return true;
    }
  }
  
  return pathname === '/' && !request.cookies.has(AUTH_COOKIE_NAME);
}

function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

export async function middleware(request: NextRequest) {
  const currentTime = Date.now();
  const pathname = request.nextUrl.pathname;
  
  if (shouldSkipMiddleware(pathname, request)) {
    return NextResponse.next();
  }
  
  const deviceType = detectDeviceType(request);
  const clientIP = getClientIP(request);

  if (!checkRateLimit(clientIP, deviceType, currentTime)) {
    return new NextResponse(null, {
      status: 429,
      headers: {
        'Content-Type': 'text/plain',
        'Retry-After': Math.ceil(RATE_LIMIT_CONFIG.BLOCK_DURATION / 1000).toString()
      }
    });
  }

  debugLog(`Processing ${deviceType} request for: ${pathname}`);

  const cookies: Cookies = {
    set: (key, value, options) => {
      request.cookies.set({ ...options, name: key, value });
      return Promise.resolve();
    },
    get: (key) => request.cookies.get(key),
    delete: (key) => request.cookies.delete(key)
  };
  
  const authResponse = await middlewareAuth(request, cookies, currentTime, deviceType);
  if (authResponse) return authResponse;
  
  const response = NextResponse.next();
  
  const sessionToken = cookies.get(AUTH_COOKIE_NAME)?.value;
  if (sessionToken) {
    const cachedSession = userSessionCache.get(sessionToken);
    
    const updateInterval = deviceType === 'MOBILE' ? 
      SESSION_UPDATE_INTERVAL : SESSION_UPDATE_INTERVAL;
    
    if (
      cachedSession && 
      currentTime - cachedSession.lastDatabaseUpdate > updateInterval / 2 &&
      currentTime - lastDbOperationTime.global > MIN_DB_OPERATION_INTERVAL[deviceType]
    ) {
      const deviceKey = `${deviceType}-${sessionToken.substring(0,8)}`;
      lastDbOperationTime.global = currentTime;
      lastDbOperationTime.byDevice.set(deviceKey, currentTime);
      
      if (deviceType === 'MOBILE') {
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

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/((?!public).)*',
    '/sign-in',
    '/sign-up'
  ],
};
