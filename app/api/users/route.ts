import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { users } from "@/app/db/schema";
import { eq, or } from "drizzle-orm";
import { getUserFromSession, CookiesHandler, COOKIE_SESSION_KEY } from "@/app/auth/core/session";

/**
 * GET /api/users
 * - Fetch all users (requires authentication)
 * - Fetch a specific user by `identifier` (username or email)
 */
export async function GET(req: NextRequest) {
  try {
    const cookiesHandler = new CookiesHandler(req);
    const sessionUser = await getUserFromSession({
      [COOKIE_SESSION_KEY]: cookiesHandler.get(COOKIE_SESSION_KEY)?.value || "",
    });

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get("identifier");

    if (identifier) {
     
      const user = await db.query.users.findFirst({
        where: or(eq(users.name, identifier), eq(users.email, identifier)),
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user);
    }

    
    const usersData = await db.select().from(users);

    if (usersData.length === 0) {
      return NextResponse.json({ message: "No users found" }, { status: 404 });
    }

    return NextResponse.json({ users: usersData });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}

/**
 * POST /api/users
 * - Creates a new user (admin access required)
 */
export async function POST(req: NextRequest) {
  try {
    const cookiesHandler = new CookiesHandler(req);
    const sessionUser = await getUserFromSession({
      [COOKIE_SESSION_KEY]: cookiesHandler.get(COOKIE_SESSION_KEY)?.value || "",
    });

    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    if (!["admin", "user"].includes(role)) {
      return NextResponse.json({ error: "Role must be 'admin' or 'user'." }, { status: 400 });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
    }

    const newUser = await db.insert(users).values({ name, email, role }).returning();

    return NextResponse.json(
      { message: "User created successfully.", user: newUser[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user." }, { status: 500 });
  }
}
