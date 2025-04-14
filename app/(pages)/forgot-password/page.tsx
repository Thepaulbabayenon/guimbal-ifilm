"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input" // Assuming shadcn/ui Input
import { Button } from "@/components/ui/button" // Assuming shadcn/ui Button
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form" // Assuming shadcn/ui Form
import { sendPasswordReset } from "@/app/actions/index" // ** IMPORTANT: This action needs backend implementation **
import Link from "next/link"
import { FiMail, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiFilm } from "react-icons/fi" // Added FiFilm icon

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(data: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true)
    setError(undefined)
    setMessage(undefined)

    try {
      // --- Placeholder for actual password reset email sending ---
      // This `sendPasswordReset` function MUST interact with your backend/auth provider (e.g., Firebase Auth, Supabase Auth, custom backend)
      // It should handle sending the reset email and return success/error status.
      console.log("Attempting password reset for:", data.email);
      // const result = await sendPasswordReset(data.email); // UNCOMMENT WHEN BACKEND ACTION IS READY

      // Simulate API call and response for demonstration:
      await new Promise(resolve => setTimeout(resolve, 1500));
      const result = { success: true, error: null }; // Placeholder success response
      // const result = { success: false, error: "User not found." }; // Placeholder error response

      if (result.success) {
        setMessage("If an account exists with this email, you'll receive a password reset link shortly.")
        form.reset(); // Clear the form on success message
      } else {
        setError(result.error || "Could not send password reset link. Please try again.")
      }
    } catch (err) {
        console.error("Forgot Password Error:", err);
        setError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-900 p-4"> {/* Updated gradient */}
      <div className="w-full max-w-md mx-auto">
        {/* Logo Placeholder */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2 text-white hover:text-red-500 transition-colors">
             <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center border-2 border-red-400">
                {/* Replace with your actual logo or initials */}
                <FiFilm className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold">Guimbal iFilm</span>
          </Link>
        </div>

        <div className="bg-black bg-opacity-80 backdrop-blur-sm rounded-xl border border-gray-800 shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white">Reset Password</h2>
              <p className="text-gray-400 mt-2">
                Enter your account's email address below.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Error Message */}
                {error && !message && ( // Show error only if no success message
                  <div className="flex items-start space-x-3 p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-300">
                    <FiAlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {message && (
                  <div className="flex items-start space-x-3 p-4 bg-green-900/50 border border-green-800 rounded-lg text-green-300">
                    <FiCheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-green-400" />
                    <p className="text-sm">{message}</p>
                  </div>
                )}

                 {/* Show form fields only if no success message */}
                {!message && (
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMail className="h-5 w-5 text-gray-500" />
                              </div>
                              <Input
                                type="email"
                                disabled={isLoading}
                                {...field}
                                className="bg-gray-900 border-gray-700 text-white pl-10 focus:border-red-500 focus:ring-red-500" // Red focus
                                placeholder="you@example.com"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" /> {/* Red error text */}
                        </FormItem>
                      )}
                    />
                )}

                 {/* Show button only if no success message */}
                {!message && (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Sending Link..." : "Send Password Reset Link"}
                    </Button>
                )}
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Link
                href="/sign-in" // Make sure this path is correct for your app
                className="flex items-center justify-center text-sm text-gray-400 hover:text-white transition-colors"
              >
                <FiArrowLeft className="mr-1 h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </div>

          <div className="px-8 py-4 bg-gray-950 border-t border-gray-800"> {/* Slightly darker footer */}
            <p className="text-center text-xs text-gray-500">
              Need help? <Link href="/support" className="text-red-500 hover:text-red-400">Contact Support</Link> {/* Link to support page */}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}