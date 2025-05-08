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

const AUTH_COOKIE_NAME = COOKIE_SESSION_KEY;

// Simplified route configuration
const ADMIN_ROUTES = ["/admin", "/admin/upload", "/admin/delete", "/admin/edit", "/admin/users", "/admin/user-edit"];
const STATIC_EXTENSIONS = ['.ico', '.png', '.jpg', '.jpeg', '.svg', '.css', '.js', '.woff', '.woff2', '.ttf'];

// Minimal LRU cache implementation
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    // Remove if already exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Evict oldest if full
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    // Add new item
    this.cache.set(key, value);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }
}

// Lightweight session cache with limited size
const sessionCache = new LRUCache<string, User>(500);
const rateLimitCache = new LRUCache<string, number[]>(2000);

// Simplified debug logging function
const DEBUG = false;
const debugLog = (...args: any[]) => {
  if (DEBUG) console.log("[Auth Middleware]", ...args);
};

// Check if path matches a static resource pattern
function isStaticResource(pathname: string): boolean {
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/api/public/') || 
      pathname.startsWith('/static/')) {
    return true;
  }
  
  const extension = pathname.slice(pathname.lastIndexOf('.'));
  return STATIC_EXTENSIONS.includes(extension);
}

// Simplified rate limit check with mobile awareness
function checkRateLimit(ip: string, isMobile: boolean): boolean {
  // Skip for localhost
  if (ip === '127.0.0.1' || ip === 'localhost') return true;

  const now = Date.now();
  const limit = isMobile ? 300 : 200;
  const window = 60000; // 1 minute
  
  // Get or initialize timestamps array
  let timestamps = rateLimitCache.get(ip) || [];
  
  // Filter out old timestamps and add current one
  timestamps = [...timestamps.filter(t => now - t < window), now];
  rateLimitCache.set(ip, timestamps);
  
  // Check if over limit
  return timestamps.length <= limit;
}

// Simplified device detection
function isMobileDevice(request: NextRequest): boolean {
  const ua = request.headers.get('user-agent') || '';
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

// Get user from cache first, then database if needed
async function getUser(sessionToken: string, cookies: Record<string, string>): Promise<User | null> {
  // Try cache first
  const cachedUser = sessionCache.get(sessionToken);
  if (cachedUser) {
    return cachedUser;
  }
  
  // Cache miss - try database
  try {
    const user = await getUserFromSession(cookies);
    if (user) {
      sessionCache.set(sessionToken, user);
    }
    return user;
  } catch (error) {
    debugLog("Error getting user:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static resources (most efficient check first)
  if (isStaticResource(pathname)) {
    return NextResponse.next();
  }
  
  // Skip for public homepage without auth cookie
  if (pathname === '/' && !request.cookies.has(AUTH_COOKIE_NAME)) {
    return NextResponse.next();
  }
  
  // Get client info
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const isMobile = isMobileDevice(request);
  
  // Basic rate limiting
  if (!checkRateLimit(clientIP, isMobile)) {
    return new NextResponse(null, {
      status: 429,
      headers: {
        'Content-Type': 'text/plain',
        'Retry-After': '120'
      }
    });
  }
  
  // Check authentication for protected routes
  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  
  // For admin routes, verify authentication
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    // No session token means redirect to sign-in
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    
    // Get cookies as object for getUserFromSession
    const cookiesObject: Record<string, string> = {};
    for (const cookie of request.cookies.getAll()) {
      cookiesObject[cookie.name] = cookie.value;
    }
    
    // Get user from cache or database
    const user = await getUser(sessionToken, cookiesObject);
    
    // Handle authentication failures
    if (!user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    
    // Check admin role
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  
  // Create response and occasionally update session
  const response = NextResponse.next();
  
  // Only update session occasionally to reduce DB load
  // Use 10% probability instead of time tracking
  if (sessionToken && Math.random() < 0.1) {
    const cookies: Cookies = {
      set: (key, value, options) => {
        request.cookies.set({ ...options, name: key, value });
        return Promise.resolve();
      },
      get: (key) => request.cookies.get(key),
      delete: (key) => request.cookies.delete(key)
    };
    
    // Don't await - let it happen in the background
    Promise.resolve().then(() => {
      updateUserSessionExpiration(cookies).catch(err => 
        debugLog("Session update error:", err)
      );
    });
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