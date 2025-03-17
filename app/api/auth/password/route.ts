// app/api/auth/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { getUserFromSession, COOKIE_SESSION_KEY, CookiesHandler } from "@/app/auth/core/session";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { z } from "zod";

// Schema for validating request body
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    // Create a response object to be able to modify cookies
    const res = NextResponse.json({});
    const cookies = new CookiesHandler(req, res);
    
    // Get the user from the session
    const cookiesObject = Object.fromEntries(
      req.cookies.getAll().map(c => [c.name, c.value])
    );
    
    const user = await getUserFromSession(cookiesObject);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = passwordChangeSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid input", 
          errors: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Get user from database with password
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: {
        id: true,
        password: true,
      },
    });

    if (!dbUser || !dbUser.password) {
      return NextResponse.json(
        { success: false, message: "User not found or using OAuth" },
        { status: 400 }
      );
    }

    // Verify current password
    const isValidPassword = await compare(currentPassword, dbUser.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update the user's password
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
