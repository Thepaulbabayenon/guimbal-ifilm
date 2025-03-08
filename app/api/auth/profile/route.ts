// app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { getUserFromSession, CookiesHandler } from "@/app/auth/core/session";
import { users } from "@/app/db/schema";
import { eq, and, not } from "drizzle-orm";
import { z } from "zod";

// Schema for validating request body
const profileUpdateSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  image: z.string().optional(),
  email: z.string().email().optional(),
  twoFactorEnabled: z.boolean().optional(),
  emailVerified: z.null().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export async function PATCH(req: NextRequest) {
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
    const validationResult = profileUpdateSchema.safeParse(body);
    
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

    // Get the validated data
    const updateData = validationResult.data;
    
    // Get current user data
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Handle email update (requires verification)
    if (updateData.email && updateData.email !== currentUser.email) {
      // Check if email is already taken
      const existingUser = await db.query.users.findFirst({
        where: and(
          eq(users.email, updateData.email),
          not(eq(users.id, user.id))
        ),
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Email already in use" },
          { status: 400 }
        );
      }

      // Reset email verification status
      updateData.emailVerified = null;
      
      // In a production app, you might want to:
      // 1. Generate a verification token
      // 2. Send verification email
    }

    // Update user profile
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, user.id));

    return NextResponse.json({ 
      success: true,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}