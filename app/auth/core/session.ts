import { NextRequest, NextResponse } from 'next/server';
import { userRoles } from "@/app/db/schema";
import { z } from "zod";
import crypto from "crypto";
import { redisClient } from "@/redis/redis";

// Seven days in seconds
const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7;
export const COOKIE_SESSION_KEY = "session-id";

const sessionSchema = z.object({
  id: z.string(),
  role: z.enum(userRoles),
});

type UserSession = z.infer<typeof sessionSchema>;

export type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax";
      expires?: number;
    }
  ) => Promise<void>;
  get: (key: string) => { name: string; value: string } | undefined;
  delete: (key: string) => void;
};

// Updated CookiesHandler for App Router
export class CookiesHandler implements Cookies {
  private req: NextRequest;
  private response: NextResponse | null;

  constructor(req: NextRequest, response?: NextResponse) {
    this.req = req;
    this.response = response || null;
  }

  async set(key: string, value: string, options: { 
    secure?: boolean; 
    httpOnly?: boolean; 
    sameSite?: "strict" | "lax"; 
    expires?: number 
  }) {
    if (!this.response) {
      throw new Error("Response object is required for setting cookies");
    }

    // Convert options to Cookie API format
    const cookieOptions: any = {};
    
    if (options.expires) {
      cookieOptions.expires = new Date(options.expires);
    }
    
    if (options.sameSite) {
      cookieOptions.sameSite = options.sameSite;
    }
    
    if (options.secure !== undefined) {
      cookieOptions.secure = options.secure;
    }
    
    if (options.httpOnly !== undefined) {
      cookieOptions.httpOnly = options.httpOnly;
    }

    this.response.cookies.set(key, value, cookieOptions);
  }

  get(key: string) {
    const cookie = this.req.cookies.get(key);
    return cookie ? { name: key, value: cookie.value } : undefined;
  }

  delete(key: string) {
    if (!this.response) {
      throw new Error("Response object is required for deleting cookies");
    }
    this.response.cookies.delete(key);
  }

  // Helper method to set the response object after construction
  setResponse(response: NextResponse) {
    this.response = response;
    return this;
  }

  // Helper method to check if response is available
  hasResponse() {
    return this.response !== null;
  }
}

export async function getUserFromSession(cookies: Record<string, string> | null): Promise<UserSession | null> {
  if (!cookies) {
    console.log("No cookies provided");
    return null;
  }

  const sessionId = cookies[COOKIE_SESSION_KEY];
  console.log("getUserFromSession called");

  if (!sessionId) {
    console.log("No session ID found in cookies");
    return null;
  }

  console.log(`Session ID found: ${sessionId}`);
  return getUserSessionById(sessionId);
}

export async function updateUserSessionData(
  user: UserSession,
  cookies: Record<string, string>
): Promise<void> {
  const sessionId = cookies[COOKIE_SESSION_KEY];
  console.log("updateUserSessionData called");

  if (!sessionId) {
    console.log("No session ID found in cookies for update");
    return;
  }

  try {
    console.log(`Updating session data for session ID: ${sessionId}`);
    const validatedUser = sessionSchema.parse(user);
    await redisClient.set(`session:${sessionId}`, JSON.stringify(validatedUser), {
      ex: SESSION_EXPIRATION_SECONDS,
    });    
    console.log("User session updated successfully in Redis");
  } catch (error) {
    console.error("Error updating user session:", error);
  }
}

export async function createUserSession(
  user: UserSession,
  cookies: Cookies
): Promise<void> {
  try {
    console.log("createUserSession called for user ID:", user.id);
    const sessionId = crypto.randomBytes(32).toString("hex");
    console.log(`Generated new session ID: ${sessionId}`);

    // Ensure user data is correctly passed
    const userSession: UserSession = {
      id: user.id,
      role: user.role,
    };

    const validatedSession = sessionSchema.parse(userSession);
    await redisClient.set(`session:${sessionId}`, validatedSession, {
      ex: SESSION_EXPIRATION_SECONDS,
    });
    console.log("User session created and stored in Redis");

    // Ensure cookies is an appropriate object for setting cookies
    if (typeof cookies.set === 'function') {
      await setCookie(sessionId, cookies);
      console.log("Session ID set in cookies");
    } else {
      console.warn("Cannot set cookie: cookies object does not have a valid set method");
    }
  } catch (error) {
    console.error("Error creating user session:", error);
    throw new Error("Failed to create user session");
  }
}

export async function updateUserSessionExpiration(
  cookies: Cookies
): Promise<void> {
  console.log("updateUserSessionExpiration called");
  const sessionCookie = cookies.get(COOKIE_SESSION_KEY);
  
  if (!sessionCookie || !sessionCookie.value) {
    console.log("No session ID found in cookies for expiration update");
    return;
  }

  const sessionId = sessionCookie.value;
  console.log(`Session ID found: ${sessionId}`);
  
  try {
    const user = await getUserSessionById(sessionId);
    if (!user) {
      console.log(`No user found for session ID: ${sessionId}`);
      return;
    }

    await redisClient.set(`session:${sessionId}`, user, {
      ex: SESSION_EXPIRATION_SECONDS,
    });
    console.log("Session expiration updated in Redis");

    await setCookie(sessionId, cookies);
    console.log("Session expiration updated in cookies");
  } catch (error) {
    console.error("Error updating session expiration:", error);
  }
}

export async function removeUserFromSession(
  cookies: Cookies
): Promise<void> {
  console.log("removeUserFromSession called");
  const sessionCookie = cookies.get(COOKIE_SESSION_KEY);
  
  if (!sessionCookie || !sessionCookie.value) {
    console.log("No session ID found in cookies for removal");
    return;
  }

  const sessionId = sessionCookie.value;
  try {
    console.log(`Removing session ID: ${sessionId} from Redis`);
    await redisClient.del(`session:${sessionId}`);
    cookies.delete(COOKIE_SESSION_KEY);
    console.log("Session ID deleted from cookies and Redis");
  } catch (error) {
    console.error("Error removing user from session:", error);
  }
}

async function setCookie(sessionId: string, cookies: Cookies): Promise<void> {
  console.log("setCookie called");
  console.log(`Setting session ID: ${sessionId} in cookies`);
  try {
    await cookies.set(COOKIE_SESSION_KEY, sessionId, {
      secure: true,
      httpOnly: true,
      sameSite: "lax",
      expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
    });
  } catch (error) {
    console.error("Error setting cookie:", error);
    throw new Error("Failed to set session cookie");
  }
}

async function getUserSessionById(sessionId: string): Promise<UserSession | null> {
  console.log(`getUserSessionById called with sessionId: ${sessionId}`);

  if (!sessionId || typeof sessionId !== 'string') {
    console.log("Invalid session ID provided");
    return null;
  }

  try {
    const rawUser = await redisClient.get(`session:${sessionId}`);

    if (!rawUser) {
      console.log(`No session data found for sessionId: ${sessionId}`);
      return null;
    }

    // Handle case where Redis client might return string instead of object
    const userObject = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;
    const { success, data: user } = sessionSchema.safeParse(userObject);

    if (!success) {
      console.log(`Failed to parse user session data for sessionId: ${sessionId}`);
      return null;
    }

    console.log(`User session found: ${JSON.stringify(user)}`);
    return user;
  } catch (error) {
    console.error("Error fetching user session:", error);
    return null;
  }
}