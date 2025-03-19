"use server";
import { db } from "@/app/db/drizzle";
import { watchLists, users } from "@/app/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";

// Types - kept unchanged
export type User = {
  id: string;
  role: "admin" | "user";
  name?: string;
  image?: string;
  email?: string;
};

export type FullUser = {
  id: string;
  email: string;
  role: "admin" | "user";
  name: string;
};


const userCache = new Map<string, { data: any, expiry: number }>();
const CACHE_TTL = 60 * 1000;

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.thebantayanfilmfestival.com';

function isValidUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Optimized to use caching
async function getCurrentUser(): Promise<User | null> {
  // Use a consistent cache key
  const cacheKey = cookies().toString();
  const cached = userCache.get(cacheKey);
  
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/user`, {
      headers: {
        cookie: cacheKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const userData = data.user || null;
    
    // Cache the result
    userCache.set(cacheKey, {
      data: userData,
      expiry: Date.now() + CACHE_TTL
    });
    
    return userData;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

// Optimized to use caching and select only needed columns
async function getUserById(userId: string) {
  if (!userId || !isValidUUID(userId)) {
    throw new Error(userId ? "Invalid user ID format" : "User ID is required");
  }

  const cacheKey = `user-${userId}`;
  const cached = userCache.get(cacheKey);
  
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  // Only select columns we need to minimize data transfer
  const [user] = await db
    .select({
      id: users.id,
      role: users.role,
      name: users.name,
      email: users.email,
      image: users.image
    })
    .from(users)
    .where(eq(users.id, userId));
  
  if (user) {
    userCache.set(cacheKey, {
      data: user,
      expiry: Date.now() + CACHE_TTL
    });
  }
  
  return user || null;
}

export const addToWatchlist = async ({
  filmId,
  pathname,
  userId,
}: {
  filmId: number;
  pathname: string;
  userId: string | undefined;
}) => {
  if (!userId || !isValidUUID(userId)) {
    throw new Error(userId ? "Invalid user ID format" : "User is not logged in");
  }

  try {
    // Check if already exists with a composite key query instead of using id
    const [existingEntry] = await db
      .select({ userId: watchLists.userId, filmId: watchLists.filmId })
      .from(watchLists)
      .where(and(eq(watchLists.filmId, filmId), eq(watchLists.userId, userId)))
      .limit(1);

    if (existingEntry) {
      return { filmId, userId };
    }

    // Insert new entry with minimal return data
    await db.insert(watchLists).values({ filmId, userId });
    return { filmId, userId };
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    throw error;
  }
};

export async function deleteFromWatchlist(userId: string, filmId: number) {
  if (!isValidUUID(userId)) {
    throw new Error("Invalid user ID format");
  }

  try {
    // More efficient deletion without returning data
    const result = await db
      .delete(watchLists)
      .where(and(eq(watchLists.filmId, filmId), eq(watchLists.userId, userId)));
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting from watchlist:", error);
    throw error;
  }
}

export async function getWatchListIdForFilm(filmId: number, userId: string): Promise<string | null> {
  if (!isValidUUID(userId)) {
    throw new Error("Invalid user ID format");
  }

  try {
    // Use userId and filmId directly instead of id field
    const [entry] = await db
      .select({ userId: watchLists.userId, filmId: watchLists.filmId })
      .from(watchLists)
      .where(and(eq(watchLists.filmId, filmId), eq(watchLists.userId, userId)))
      .limit(1);

    return entry ? `${userId}-${filmId}` : null;
  } catch (error) {
    console.error("Error fetching watchListId:", error);
    return null;
  }
}

// Role management with improved validation flow
export async function setRole(requestingUserId: string, targetUserId: string, role: "admin" | "user") {
  if (!isValidUUID(requestingUserId) || !isValidUUID(targetUserId)) {
    throw new Error("Invalid user ID format");
  }

  // Verify admin status
  const requestingUser = await getUserById(requestingUserId);
  if (!requestingUser || requestingUser.role !== "admin") {
    throw new Error("Not Authorized");
  }

  try {
    await db
      .update(users)
      .set({ role })
      .where(eq(users.id, targetUserId));
    
    // Clear cache for this user
    userCache.delete(`user-${targetUserId}`);
    
    return { success: true };
  } catch (err) {
    console.error("Error setting role:", err);
    throw new Error("Failed to set role");
  }
}

export async function removeRole(requestingUserId: string, targetUserId: string) {
  if (!isValidUUID(requestingUserId) || !isValidUUID(targetUserId)) {
    throw new Error("Invalid user ID format");
  }

  // Verify admin status
  const requestingUser = await getUserById(requestingUserId);
  if (!requestingUser || requestingUser.role !== "admin") {
    throw new Error("Not Authorized");
  }

  try {
    await db
      .update(users)
      .set({ role: "user" })
      .where(eq(users.id, targetUserId));
    
    // Clear cache for this user
    userCache.delete(`user-${targetUserId}`);
    
    return { success: true };
  } catch (err) {
    console.error("Error removing role:", err);
    throw new Error("Failed to remove role");
  }
}

export async function checkRole(requiredRole: 'admin' | 'user') {
  const user = await getCurrentUser();
  return user ? user.role === requiredRole : false;
}