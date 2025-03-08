"use server";
import { db } from "@/app/db/drizzle";
import { watchLists, users } from "@/app/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";


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

// UUID validation helper
function isValidUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Server-side function to get current user
// This replaces the imported getCurrentUser function
async function getCurrentUser(): Promise<User | null> {
  try {
    // Since this is a server component, we need to access the API directly
    // rather than using the client-side fetch approach
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://thebantayanfilmfestival.com'}/api/auth/user`, {
      headers: {
        cookie: cookies().toString(),
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch user, status:", response.status);
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

// ✅ Get user by ID, but validate userId first
async function getUserById(userId: string) {
  console.log("🔍 Checking user ID:", userId); // Debugging log

  if (!userId) {
    console.error("❌ User ID is missing!");
    throw new Error("User ID is required");
  }

  if (!isValidUUID(userId)) {
    console.error("❌ Invalid UUID detected in getUserById:", userId);
    throw new Error("Invalid user ID format");
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
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
  if (!userId) {
    throw new Error("User is not logged in");
  }

  if (!isValidUUID(userId)) {
    throw new Error("Invalid user ID format");
  }

  try {
    const [entry] = await db
      .select({ userId: watchLists.userId, filmId: watchLists.filmId })
      .from(watchLists)
      .where(and(eq(watchLists.filmId, filmId), eq(watchLists.userId, userId)));

    if (entry) {
      return entry;
    }

    const [newEntry] = await db.insert(watchLists).values({ filmId, userId }).returning();
    return newEntry;
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
    const deleted = await db
      .delete(watchLists)
      .where(and(eq(watchLists.filmId, filmId), eq(watchLists.userId, userId)))
      .returning();

    if (!deleted.length) {
      throw new Error("Failed to delete from watchlist");
    }

    return deleted;
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
    const entry = await db
      .select({ userId: watchLists.userId, filmId: watchLists.filmId })
      .from(watchLists)
      .where(and(eq(watchLists.filmId, filmId), eq(watchLists.userId, userId)))
      .limit(1);

    return entry.length > 0 ? `${entry[0].userId}-${entry[0].filmId}` : null;
  } catch (error) {
    console.error("Error fetching watchListId for movie:", error);
    return null;
  }
}

export async function setRole(requestingUserId: string, targetUserId: string, role: "admin" | "user") {
  console.log("🔍 Assigning role", role, "to user:", targetUserId, "Requested by:", requestingUserId);

  if (!isValidUUID(requestingUserId) || !isValidUUID(targetUserId)) {
    console.error("❌ Invalid UUID detected in setRole:", { requestingUserId, targetUserId });
    throw new Error("Invalid user ID format");
  }

  // Verify that requesting user is an admin
  const requestingUser = await getUserById(requestingUserId);
  if (!requestingUser || requestingUser.role !== "admin") {
    throw new Error("Not Authorized");
  }

  try {
    const [updatedUser] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, targetUserId))
      .returning();

    return updatedUser;
  } catch (err) {
    console.error("❌ Error setting role:", err);
    throw new Error("Failed to set role");
  }
}

export async function removeRole(requestingUserId: string, targetUserId: string) {
  if (!isValidUUID(requestingUserId) || !isValidUUID(targetUserId)) {
    throw new Error("Invalid user ID format");
  }

  // Verify that requesting user is an admin
  const requestingUser = await getUserById(requestingUserId);
  if (!requestingUser || requestingUser.role !== "admin") {
    throw new Error("Not Authorized");
  }

  try {
    const [updatedUser] = await db
      .update(users)
      .set({ role: "user" })
      .where(eq(users.id, targetUserId))
      .returning();

    return updatedUser;
  } catch (err) {
    console.error("Error removing role:", err);
    throw new Error("Failed to remove role");
  }
}

export async function checkRole(requiredRole: 'admin' | 'user') {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  return user.role === requiredRole;
}