// actions/preferences.ts
'use server';

import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/db/drizzle";
import { userPreferences } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function updatePreferences(prevState: any, formData: FormData) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const data = {
    favoriteGenres: formData.get("favoriteGenres") as string,
    contentPreferences: formData.get("contentPreferences") as string,
  };

  await db
    .insert(userPreferences)
    .values({
      userId,
      ...data,
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: data,
    });

  return { success: true };
}