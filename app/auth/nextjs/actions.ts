"use server"

import { z } from "zod"
import { redirect } from "next/navigation"
import { signInSchema, signUpSchema } from "./schemas"
import { db } from "@/app/db/drizzle"
import { OAuthProvider, users } from "@/app/db/schema";
import { eq } from "drizzle-orm"
import {
  comparePasswords,
  generateSalt,
  hashPassword,
} from "../core/passwordHasher"
import { cookies } from "next/headers"
import { createUserSession, removeUserFromSession } from "../core/session"
import { getOAuthClient } from "../core/oauth/base"

// Define the CookieAdapter type to match the expected Cookies API
type CookieAdapter = {
  set: (name: string, value: string, options?: any) => Promise<void>;
  get: (name: string) => { name: string; value: string } | undefined;
  delete: (name: string) => void;
};

// Create a cookie adapter from Next.js cookies
async function createCookieAdapter(nextCookiesPromise: ReturnType<typeof cookies>): Promise<CookieAdapter> {
  const nextCookies = await nextCookiesPromise;
  
  return {
    set: async (name, value, options) => {
      nextCookies.set(name, value, options);
      console.log(`Set cookie: ${name}`); 
      return Promise.resolve();
    },
    get: (name) => {
      const cookie = nextCookies.get(name);
      console.log(`Get cookie: ${name} = ${cookie ? 'found' : 'not found'}`); 
      return cookie ? { name: cookie.name, value: cookie.value } : undefined;
    },
    delete: (name) => {
      nextCookies.delete(name);
      console.log(`Deleted cookie: ${name}`); 
    },
  };
}

// OAuthClient interface
export interface OAuthClient<T> {
  createAuthUrl(cookieAdapter: any): string;
  // Other methods that would be common across OAuth clients
}

// GoogleOAuthClient interface
export interface GoogleOAuthClient {
  fetchUserDetails(code: string, state: string): Promise<any>;
}

// Type for return values
type AuthResult = 
  | { success: true; [key: string]: any }
  | { success: false; error: string };

export async function signIn(unsafeData: z.infer<typeof signInSchema>): Promise<AuthResult> {
  console.log("Received sign-in data");
  
  const result = signInSchema.safeParse(unsafeData);
  if (!result.success) {
    console.log("Invalid sign-in data");
    return { success: false, error: "Invalid email or password format" };
  }

  const data = result.data;

  try {
    console.log("Querying user by email:", data.email);
    const user = await db.query.users.findFirst({
      columns: { password: true, salt: true, id: true, email: true, role: true },
      where: eq(users.email, data.email),
    });

    if (!user || !user.password || !user.salt) {
      console.log("User not found or missing password/salt for:", data.email); 
      return { success: false, error: "Invalid email or password" };
    }

    const isCorrectPassword = await comparePasswords({
      hashedPassword: user.password,
      password: data.password,
      salt: user.salt,
    });

    if (!isCorrectPassword) {
      console.log("Incorrect password for user:", data.email); 
      return { success: false, error: "Invalid email or password" };
    }

    const cookieAdapter = await createCookieAdapter(cookies());
    
    console.log("Creating user session for:", data.email);
    
    // Create a proper user session object
    const userSession = {
      id: user.id,
      role: user.role
    };
    
    await createUserSession(userSession, cookieAdapter);
    console.log("Authentication successful");
    
    return { success: true };
  } catch (error) {
    console.error("Error during sign-in process:", error);
    return { success: false, error: "Unable to log you in. Please try again later." };
  }
}

export async function signUp(unsafeData: z.infer<typeof signUpSchema>): Promise<AuthResult> {
  console.log("Received sign-up data");

  const result = signUpSchema.safeParse(unsafeData);
  
  if (!result.success) {
    console.log("Invalid sign-up data:", result.error.format());
    return { success: false, error: "Please provide valid registration information" };
  }

  const data = result.data;

  try {
    console.log("Checking if user already exists with email:", data.email);
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existingUser) {
      console.log("Account already exists for this email");
      return { success: false, error: "Account already exists for this email" };
    }

    console.log("Creating new user account");
    const salt = generateSalt();
    const hashedPassword = await hashPassword(data.password, salt);

    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        salt,
        username: data.username,
      })
      .returning({ id: users.id, role: users.role });

    if (!user) {
      console.log("Failed to create user account");
      return { success: false, error: "Unable to create account. Please try again." };
    }

    const cookieAdapter = await createCookieAdapter(cookies());
    console.log("Creating session for new user:", data.email);
    
    await createUserSession(user, cookieAdapter);
    console.log("Sign-up successful");
    
    return { success: true };
  } catch (error) {
    console.error("Error during sign-up process:", error);
    return { success: false, error: "Unable to create account. Please try again later." };
  }
}

export async function logOut(): Promise<AuthResult> {
  const cookieAdapter = await createCookieAdapter(cookies());
  console.log("Logging out user...");
  
  try {
    await removeUserFromSession(cookieAdapter);
    console.log("User logged out successfully");
    
    return { success: true };
  } catch (error) {
    console.error("Error during logout process:", error);
    return { success: false, error: "Error during logout" };
  }
}

export async function oAuthSignIn(provider: OAuthProvider): Promise<AuthResult> {
  console.log("Initiating OAuth sign-in for provider:", provider);

  try {
    // Get the appropriate OAuth client
    const oAuthClient: OAuthClient<any> = getOAuthClient(provider);

    const cookieAdapter = await createCookieAdapter(cookies());
    const authUrl = oAuthClient.createAuthUrl(cookieAdapter);

    console.log("Generated OAuth URL:", authUrl);
    
    return { success: true, authUrl };
  } catch (error) {
    console.error("Error initiating OAuth sign-in:", error);
    return { success: false, error: "Unable to sign in with this provider. Please try again later." };
  }
}

// Function for forced server-side redirects
export async function redirectTo(path: string) {
  redirect(path);
}