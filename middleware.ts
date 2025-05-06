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
}

const AUTH_COOKIE_NAME = COOKIE_SESSION_KEY;
const DEBUG = process.env.NODE_ENV === 'development';

const STATIC_ROUTES = {
  public: /^\/(sign-in|sign-up|reset-password|)$/,
  admin: /^\/admin/,
  static: /^\/_next|^\/api\/public|^\/static|\.(?:ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/
};

const CONFIG = {
  SESSION: {
    CACHE_DURATION: 60 * 60 * 1000,     
    UPDATE_INTERVAL: 6 * 60 * 60 * 1000, 
    GRACE_PERIOD: 10 * 60 * 1000,       
  },
  RATE_LIMIT: {
    MAX_REQUESTS: 200,                 
    WINDOW_SIZE: 60 * 1000,            
  }
};

class SimpleCache<T> {
  private cache = new Map<string, T>();
  private maxSize: number;
  
  constructor(maxSize = 10000) {
    this.maxSize = maxSize;
  }
  
  get(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  cleanup(isExpired: (value: T) => boolean): void {
    for (const [key, value] of this.cache.entries()) {
      if (isExpired(value)) {
        this.cache.delete(key);
      }
    }
  }
}

const sessionCache = new SimpleCache<CachedSession>(5000);
const rateLimitCache = new SimpleCache<{ count: number, resetTime: number }>(10000);
const dbAccessCache = new SimpleCache<number>(5000);

const debugLog = DEBUG ? (...args: any[]) => console.log("[Auth]", ...args) : () => {};

if (typeof window === 'undefined' && !process.env.VERCEL) {
  setInterval(() => {
    const now = Date.now();
    
    sessionCache.cleanup(session => now > session.expiresAt + CONFIG.SESSION.GRACE_PERIOD);
    
    rateLimitCache.cleanup(data => now - data.resetTime > CONFIG.RATE_LIMIT.WINDOW_SIZE * 60);
    
  }, 30 * 60 * 1000).unref(); 
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') || 
    request.headers.get('cf-connecting-ip') || 
    'unknown'
  );
}

function checkRateLimit(ip: string, currentTime: number): boolean {
  if (ip === '127.0.0.1' || ip === 'localhost') return true;
  
  let entry = rateLimitCache.get(ip);
  if (!entry || currentTime - entry.resetTime >= CONFIG.RATE_LIMIT.WINDOW_SIZE) {
    entry = { count: 1, resetTime: currentTime };
    rateLimitCache.set(ip, entry);
    return true;
  }
  
  entry.count++;
  rateLimitCache.set(ip, entry); 
  return entry.count <= CONFIG.RATE_LIMIT.MAX_REQUESTS;
}

function shouldSkipMiddleware(pathname: string): boolean {
  return STATIC_ROUTES.static.test(pathname);
}

function isPublicRoute(pathname: string): boolean {
  return STATIC_ROUTES.public.test(pathname);
}

function isAdminRoute(pathname: string): boolean {
  return STATIC_ROUTES.admin.test(pathname);
}

async function authenticateRequest(
  request: NextRequest, 
  cookies: Cookies,
): Promise<{ user: User | null, redirect?: URL }> {
  const sessionToken = cookies.get(AUTH_COOKIE_NAME)?.value;
  const pathname = request.nextUrl.pathname;
  const currentTime = Date.now();
  
  if (isPublicRoute(pathname)) {
    return { user: null };
  }
  
  if (!sessionToken) {
    return isAdminRoute(pathname) 
      ? { user: null, redirect: new URL("/sign-in", request.url) }
      : { user: null };
  }
  
  const cachedSession = sessionCache.get(sessionToken);
  
  if (cachedSession && currentTime < cachedSession.expiresAt) {
    if (isAdminRoute(pathname) && cachedSession.user?.role !== "admin") {
      return { user: cachedSession.user, redirect: new URL("/", request.url) };
    }
    
    const timeToExpiry = cachedSession.expiresAt - currentTime;
    if (timeToExpiry < CONFIG.SESSION.CACHE_DURATION * 0.2 && 
        currentTime - cachedSession.lastDatabaseUpdate > 5 * 60 * 1000) { 
      refreshUserSession(sessionToken, cookies).catch(debugLog);
    }
    
    return { user: cachedSession.user };
  }
  
  if (cachedSession && currentTime < cachedSession.expiresAt + CONFIG.SESSION.GRACE_PERIOD) {
    const lastDbAccess = dbAccessCache.get(sessionToken) || 0;
    if (currentTime - lastDbAccess > 10000) { 
      refreshUserSession(sessionToken, cookies).catch(debugLog);
    }
    
    if (isAdminRoute(pathname) && cachedSession.user?.role !== "admin") {
      return { user: cachedSession.user, redirect: new URL("/", request.url) };
    }
    return { user: cachedSession.user };
  }
  
  const lastDbAccess = dbAccessCache.get(sessionToken) || 0;
  const isDatabaseFetching = currentTime - lastDbAccess < 5000; 
  
  if (isDatabaseFetching && cachedSession) {
    if (isAdminRoute(pathname) && cachedSession.user?.role !== "admin") {
      return { user: cachedSession.user, redirect: new URL("/", request.url) };
    }
    return { user: cachedSession.user };
  }
  
  dbAccessCache.set(sessionToken, currentTime);
  
  try {
    const cookiesObject = Object.fromEntries(
      request.cookies.getAll().map(cookie => [cookie.name, cookie.value])
    );
    
    const user = await getUserFromSession(cookiesObject);
    
    if (user) {
      sessionCache.set(sessionToken, {
        user,
        expiresAt: currentTime + CONFIG.SESSION.CACHE_DURATION,
        lastDatabaseUpdate: currentTime
      });
      
      if (isAdminRoute(pathname) && user.role !== "admin") {
        return { user, redirect: new URL("/", request.url) };
      }
      return { user };
    } else {
      sessionCache.delete(sessionToken);
      cookies.delete(AUTH_COOKIE_NAME);
      
      if (isAdminRoute(pathname)) {
        return { user: null, redirect: new URL("/sign-in", request.url) };
      }
      return { user: null };
    }
  } catch (error) {
    debugLog("Session error:", error);
    
    if (cachedSession) {
      if (isAdminRoute(pathname) && cachedSession.user?.role !== "admin") {
        return { user: cachedSession.user, redirect: new URL("/", request.url) };
      }
      return { user: cachedSession.user };
    }
    
    if (isAdminRoute(pathname)) {
      return { user: null, redirect: new URL("/sign-in", request.url) };
    }
    return { user: null };
  }
}

async function refreshUserSession(sessionToken: string, cookies: Cookies) {
  const currentTime = Date.now();
  
  dbAccessCache.set(sessionToken, currentTime);
  
  try {
    await updateUserSessionExpiration(cookies);
    
    const session = sessionCache.get(sessionToken);
    if (session) {
      sessionCache.set(sessionToken, {
        ...session,
        lastDatabaseUpdate: currentTime
      });
    }
  } catch (error) {
    debugLog("Session update error:", error);
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }
  
  const clientIP = getClientIP(request);
  if (!checkRateLimit(clientIP, Date.now())) {
    return new NextResponse(null, {
      status: 429,
      headers: {
        'Content-Type': 'text/plain',
        'Retry-After': '60'
      }
    });
  }
  
  const cookies: Cookies = {
    set: (key, value, options) => {
      request.cookies.set({ ...options, name: key, value });
      return Promise.resolve();
    },
    get: (key) => request.cookies.get(key),
    delete: (key) => request.cookies.delete(key)
  };
  
  const { user, redirect } = await authenticateRequest(request, cookies);

  if (redirect) {
    return NextResponse.redirect(redirect);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/((?!public).)*',
    '/sign-in',
    '/sign-up',
    '/reset-password'
  ],
};