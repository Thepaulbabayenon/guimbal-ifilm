export const dynamic = "force-dynamic"; // Forces the API to run on every request

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { users } from "@/app/db/schema";
import { getUserFromSession, CookiesHandler, COOKIE_SESSION_KEY } from "@/app/auth/core/session";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
  
    const cookiesHandler = new CookiesHandler(req);
    const userSession = await getUserFromSession({
      [COOKIE_SESSION_KEY]: cookiesHandler.get(COOKIE_SESSION_KEY)?.value || "",
    });

  
    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🟢 Authenticated user:", userSession.id);

    
    const user = await db.query.users.findFirst({
      where: eq(users.id, userSession.id),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user." }, { status: 500 });
  }
}
