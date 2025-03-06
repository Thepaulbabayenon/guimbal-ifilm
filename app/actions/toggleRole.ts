"use server";

import { updateUserSessionData } from "@/app/auth/core/session";
import { useUser } from "@/app/auth/nextjs/useUser";
import { db } from "@/app/db/drizzle";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function toggleRole() {

  const userSession = await useUser(); 

  const user = userSession?.user;

  if (!user || !user.id) {
    throw new Error("User not found");
  }

  if (typeof user.id !== "string") {
    throw new Error("User ID must be a string");
  }

  // Toggle role
  const newRole = user.role === "admin" ? "user" : "admin";

  const [updatedUser] = await db
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, user.id))
    .returning({ id: users.id, role: users.role });

  // Convert ReadonlyRequestCookies to a plain object
  const cookieObj: Record<string, string> = {};
  const nextCookies = cookies(); // Get cookies

  // Iterate over cookies and extract values safely
  for (const [name, cookie] of Object.entries(nextCookies)) {
    if (typeof cookie === "string") {
      cookieObj[name] = cookie;
    } else if (cookie && typeof cookie === "object" && "value" in cookie && typeof (cookie as any).value === "string") {
      cookieObj[name] = (cookie as any).value;
    }
  }

  // Update user session data
  await updateUserSessionData(updatedUser, cookieObj);
}
