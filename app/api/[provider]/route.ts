import { getOAuthClient } from "@/app/auth/core/oauth/base"
import { createUserSession } from "@/app/auth/core/session"
import { db } from "@/app/db/drizzle"
import {
  OAuthProvider,
  oAuthProviders,
  userOAuthAccounts,
  users,
} from "@/app/db/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NextRequest } from "next/server"
import { z } from "zod"

function getCookiesWrapper() {
  const nextCookies = cookies();
  return {
    set: (key: string, value: string, options: { secure?: boolean; httpOnly?: boolean; sameSite?: "strict" | "lax"; expires?: number }) => {
     
      nextCookies.set(key, value, options)
      return Promise.resolve();
    },
    get: (key: string) => nextCookies.get(key), 
    delete: (key: string) => nextCookies.delete(key),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: rawProvider } = await params
  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const provider = z.enum(oAuthProviders).parse(rawProvider)

  if (typeof code !== "string" || typeof state !== "string") {
    redirect(
      `/sign-in?oauthError=${encodeURIComponent(
        "Failed to connect. Please try again."
      )}`
    )
  }

  const oAuthClient = getOAuthClient(provider)
  try {
    const userCookies = getCookiesWrapper(); 
    const oAuthUser = await oAuthClient.fetchUser(code, state, userCookies)
    const user = await connectUserToAccount(oAuthUser, provider)
    await createUserSession(user, userCookies)
  } catch (error) {
    console.error(error)
    redirect(
      `/sign-in?oauthError=${encodeURIComponent(
        "Failed to connect. Please try again."
      )}`
    )
  }

  redirect("/")
}

async function connectUserToAccount(
  { id, email, name }: { id: string; email: string; name: string },
  provider: OAuthProvider
) {
  // First find the user
  let user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true, role: true },
  })

  // If no user exists, create one
  if (user == null) {
    const [newUser] = await db
      .insert(users)
      .values({
        email: email,
        name: name,
      })
      .returning({ id: users.id, role: users.role })
    user = newUser
  }

  // Connect the OAuth account to the user
  await db
    .insert(userOAuthAccounts)
    .values({
      provider,
      providerAccountId: id,
      userId: user.id,
    })
    .onConflictDoNothing()

  return user
}