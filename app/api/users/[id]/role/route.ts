import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromSession, CookiesHandler } from "@/app/auth/core/session"; 


export async function PATCH(
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
    
    // Get the role from the request body
    const body = await request.json();
    const { role } = body;
    
    // Validate role
    if (role !== "admin" && role !== "user") {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin' or 'user'." },
        { status: 400 }
      );
    }
    
    // Update the user's role
    await db.update(users)
      .set({ role })
      .where(eq(users.id, params.id));
    
    return NextResponse.json(
      { message: "User role updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role." },
      { status: 500 }
    );
  }
}