import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromSession, CookiesHandler } from "@/app/auth/core/session";

export async function DELETE(
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
    
    // Prevent deleting yourself
    if (params.id === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account." },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const userToDelete = await db.query.users.findFirst({
      where: eq(users.id, params.id),
    });
    
    if (!userToDelete) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }
    
    // Delete the user
    await db.delete(users).where(eq(users.id, params.id));
    
    return NextResponse.json(
      { message: "User deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user." },
      { status: 500 }
    );
  }
}