import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/app/db/drizzle'
import { resetTokens, users } from '@/app/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import { hashPassword, generateSalt } from '@/app/auth/core/passwordHasher' 

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(req: NextRequest) {
  try {
    console.log("Reset password request received");
    const body = await req.json()
    const { email, token, password } = resetPasswordSchema.parse(body)

    // Check if token is valid and not expired
    const resetTokenResult = await db
      .select()
      .from(resetTokens)
      .where(
        and(
          eq(resetTokens.email, email),
          eq(resetTokens.token, token),
          gt(resetTokens.expiresAt, new Date())
        )
      )
      .limit(1)

    if (!resetTokenResult.length) {
      console.log("Invalid or expired token for email:", email);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    const resetToken = resetTokenResult[0]

    // Find the user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!userResult.length) {
      console.log("User not found for email:", email);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      )
    }

    const user = userResult[0]

    // Generate a salt and hash the password using the imported functions
    const salt = generateSalt()
    const hashedPassword = await hashPassword(password, salt)
    
    // Store both salt and hashedPassword in the database
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        salt: salt  // Assuming you have a salt column in your users table
      })
      .where(eq(users.id, user.id))

    // Delete the used reset token
    await db
      .delete(resetTokens)
      .where(eq(resetTokens.id, resetToken.id))

    console.log("Password reset successful for user:", user.id);
    return NextResponse.json({
      success: true,
      message: 'Password reset successful'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors[0].message);
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}