import { db } from "@/app/db/drizzle"
import { resetTokens } from "./schema"
import crypto from "crypto"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)


async function saveResetToken(email: string, token: string) {
  await db.insert(resetTokens).values({
    email,
    token,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60), 
  })
}

export async function sendResetEmail(email: string) {
  try {
    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex")

    // Save token to DB
    await saveResetToken(email, token)

    // Construct reset link
    const resetLink = `https://thebantayanfilmfestival.com/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    // Send email
    await resend.emails.send({
      from: "noreply@thebantayanfilmfestival.com",
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link is valid for 1 hour.</p>
      `,
    })

    return true
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return false
  }
}
