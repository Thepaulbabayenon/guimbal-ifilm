import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromSession, CookiesHandler } from "@/app/auth/core/session";


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  
  const cookies = new CookiesHandler(request);

  try {
   
    const currentUser = await getUserFromSession(
      request.cookies.getAll().reduce((acc, cookie) => {
        acc[cookie.name] = cookie.value;
        return acc;
      }, {} as Record<string, string>)
    );
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, params.id),
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user." },
      { status: 500 }
    );
  }
}

// PUT to update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Create a CookiesHandler instance
  const cookies = new CookiesHandler(request);

  try {
    // Check if the current user is an admin using session management
    const currentUser = await getUserFromSession(
      request.cookies.getAll().reduce((acc, cookie) => {
        acc[cookie.name] = cookie.value;
        return acc;
      }, {} as Record<string, string>)
    );
    
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }
    
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, params.id),
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }
    
    // Get updated data from request body
    const body = await request.json();
    const { name, email, role } = body;
    
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }
    
    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }
    
    // Validate role
    if (role !== "admin" && role !== "user") {
      return NextResponse.json(
        { error: "Role must be either 'admin' or 'user'." },
        { status: 400 }
      );
    }
    
    // Check if the updated email is already in use by another user
    if (email !== existingUser.email) {
      const userWithEmail = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      });
      
      if (userWithEmail && userWithEmail.id !== params.id) {
        return NextResponse.json(
          { error: "Email is already in use by another user." },
          { status: 409 }
        );
      }
    }
    
    // Update the user
    await db.update(users)
      .set({
        name,
        email,
        role,
      })
      .where(eq(users.id, params.id));
    
    return NextResponse.json({
      message: "User updated successfully."
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user." },
      { status: 500 }
    );
  }
}

// Import DELETE handler from separate file
export { DELETE } from "./deleteUser";