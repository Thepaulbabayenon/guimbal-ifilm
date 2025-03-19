import { NextRequest, NextResponse } from 'next/server';
import { userRoles, sessions, users } from "@/app/db/schema";
import { z } from "zod";
import { db } from "@/app/db/drizzle";
import { and, eq, sql } from "drizzle-orm";


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

  setResponse(response: NextResponse) {
    this.response = response;
    return this;
  }

  hasResponse() {
    return this.response !== null;
  }
}

export async function getUserFromSession(cookies: Record<string, string> | null): Promise<UserSession | null> {
  if (!cookies) {
    return null;
  }

  const sessionToken = cookies[COOKIE_SESSION_KEY];

  if (!sessionToken) {
    return null;
  }
  
  return getUserSessionByToken(sessionToken);
}

export async function updateUserSessionData(
  user: UserSession,
  cookies: Record<string, string>
): Promise<void> {
  const sessionToken = cookies[COOKIE_SESSION_KEY];
 
  if (!sessionToken) {
    return;
  }

  try {

    const validatedUser = sessionSchema.parse(user);
    
  
    const existingSession = await db.query.sessions.findFirst({
      where: eq(sessions.sessionToken, sessionToken),
    });
    
    if (!existingSession) {
      return;
    }
    
  
    await db.update(users)
      .set({ role: validatedUser.role })
      .where(eq(users.id, validatedUser.id));
      
  } catch (error) {
    console.error("Error updating user session:", error);
  }
}

export async function createUserSession(
  user: UserSession,
  cookies: Cookies
): Promise<void> {
  try {
  
    const validatedUser = sessionSchema.parse(user);
    

    const existingSession = await findExistingUserSession(user.id);
    let sessionToken = existingSession?.sessionToken;
    
  
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + SESSION_EXPIRATION_SECONDS);
    
   
    if (!sessionToken) {
      sessionToken = await generateUUID();
      
    
      await db.insert(sessions).values({
        sessionToken,
        userId: user.id,
        expires: expiresAt,
      });
    } else {
    
      await db.update(sessions)
        .set({ expires: expiresAt })
        .where(eq(sessions.sessionToken, sessionToken));
    }
    
  
    if (typeof cookies.set === 'function') {
      await setCookie(sessionToken, cookies);
    } else {
      throw new Error("Cannot set cookie: cookies object does not have a valid set method");
    }
  } catch (error) {
    console.error("Error creating user session:", error);
    throw new Error("Failed to create user session");
  }
}


async function findExistingUserSession(userId: string): Promise<{ sessionToken: string } | null> {
  try {
    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.userId, userId),
        sql`${sessions.expires} > NOW()`
      ),
    });
    
    if (!session) {
      return null;
    }
    
    return { sessionToken: session.sessionToken };
  } catch (error) {
    console.error("Error finding existing user session:", error);
    return null;
  }
}

export async function updateUserSessionExpiration(
  cookies: Cookies
): Promise<void> {
  const sessionCookie = cookies.get(COOKIE_SESSION_KEY);
  
  if (!sessionCookie || !sessionCookie.value) {
    return;
  }

  const sessionToken = sessionCookie.value;
  
  try {
  
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + SESSION_EXPIRATION_SECONDS);
    
    // Update session expiration
    await db.update(sessions)
      .set({ expires: expiresAt })
      .where(eq(sessions.sessionToken, sessionToken));
    
    // Update cookie expiration
    await setCookie(sessionToken, cookies);
  } catch (error) {
    console.error("Error updating session expiration:", error);
  }
}

export async function removeUserFromSession(
  cookies: Cookies
): Promise<void> {
  const sessionCookie = cookies.get(COOKIE_SESSION_KEY);
  
  if (!sessionCookie || !sessionCookie.value) {
    return;
  }

  const sessionToken = sessionCookie.value;
  try {
  
    await db.delete(sessions)
      .where(eq(sessions.sessionToken, sessionToken));
    
    // Delete the cookie
    cookies.delete(COOKIE_SESSION_KEY);
  } catch (error) {
    console.error("Error removing user from session:", error);
  }
}

async function setCookie(sessionToken: string, cookies: Cookies): Promise<void> {
  try {
    await cookies.set(COOKIE_SESSION_KEY, sessionToken, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
    });
  } catch (error) {
    throw new Error("Failed to set session cookie");
  }
}

async function getUserSessionByToken(sessionToken: string): Promise<UserSession | null> {
  if (!sessionToken || typeof sessionToken !== 'string') {
    return null;
  }

  try {
  
    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.sessionToken, sessionToken),
        sql`${sessions.expires} > NOW()`
      ),
      with: {
        user: true,
      },
    });

    if (!session || !session.user) {
      return null;
    }

 
    const userSession: UserSession = {
      id: session.userId,
      role: session.user.role,
    };

    return sessionSchema.parse(userSession);
  } catch (error) {
    console.error("Error fetching user session:", error);
    return null;
  }
}


async function generateUUID(): Promise<string> {
 
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);
  
  buffer[6] = (buffer[6] & 0x0f) | 0x40;
  buffer[8] = (buffer[8] & 0x3f) | 0x80;
  

  const hexCodes = [...buffer].map(value => {
    const hexCode = value.toString(16);
    return hexCode.padStart(2, '0');
  });
  
  return [
    hexCodes.slice(0, 4).join(''),
    hexCodes.slice(4, 6).join(''),
    hexCodes.slice(6, 8).join(''),
    hexCodes.slice(8, 10).join(''),
    hexCodes.slice(10, 16).join('')
  ].join('-');
}

export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await db.delete(sessions)
      .where(sql`${sessions.expires} < NOW()`)
      .returning({ id: sessions.id });
    
    return result.length;
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
    return 0;
  }
}