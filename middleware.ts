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


let lastCleanupTime = 0;
const CLEANUP_INTERVAL = 1000 * 60 * 60


export async function middleware(request: NextRequest) {
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


  const currentTime = Date.now();
  if (currentTime - lastCleanupTime > CLEANUP_INTERVAL) {
    try {
   
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
  

  if (response) {
    await updateUserSessionExpiration(cookies);
  }
 
  return response;
}

async function middlewareAuth(request: NextRequest, cookies: Cookies) {
  // Convert cookies to an object for getUserFromSession
  const cookiesObject: { [key: string]: string } = {};
  const allCookies = request.cookies.getAll();
  allCookies.forEach((cookie: { name: string, value: string }) => {
    cookiesObject[cookie.name] = cookie.value;
  });

  
  const user: User | null = await getUserFromSession(cookiesObject);
  console.log("User from session:", user);


  if (privateRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!isUserAuthenticated(user)) {
      console.log("User not authenticated for private route, redirecting to /sign-in");
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }


  if (adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    console.log("Attempting to access admin route");
    
    if (!isUserAuthenticated(user)) {
      console.log("User not authenticated, redirecting to /sign-in");
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    
    console.log("User role:", user?.role);
    if (!isUserAdmin(user)) {
      console.log("User is not an admin, redirecting to /");
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  
  if (shouldDeleteCookie(user)) {
    cookies.delete("__clerk_db_jwt");
  }
  console.log("Complete user object:", JSON.stringify(user));
  console.log("Is user admin?", isUserAdmin(user));
  console.log("Authentication check passed");
  return null; 
}


const isUserAuthenticated = (user: User | null) => !!user;
const isUserAdmin = (user: User | null) => user && user.role === "admin";
const shouldDeleteCookie = (user: User | null) => !user;

// Configure matcher for middleware
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};