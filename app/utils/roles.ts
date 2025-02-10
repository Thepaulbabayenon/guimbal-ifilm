"use server"; // ✅ Ensure it's server-only

import { clerkClient, currentUser } from "@clerk/nextjs/server";

export async function checkRole(role: string): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false; // No user logged in

  return user.publicMetadata?.role === role; // Check role from Clerk metadata
}
