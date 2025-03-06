'use server';

import { useUser } from "@/app/auth/nextjs/useUser"; 
import { db } from "@/app/db/drizzle";
import { userPreferences } from "@/app/db/schema";
export async function updatePreferences(prevState: any, formData: FormData) {
  // Retrieve user session
  const user = await useUser();

  if (!user || !user.user?.id) {
    throw new Error("Unauthorized: No user session found");
  }

  const userId = user.user.id; // Ensure userId is a string

  const data = {
    favoriteGenres: formData.get("favoriteGenres") as string | null,
    contentPreferences: formData.get("contentPreferences") as string | null,
  };

  await db
    .insert(userPreferences)
    .values({
      userId, // Now userId is guaranteed to be a string
      ...data,
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: data,
    });

  return { success: true };
}
