"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { sendPasswordReset } from "@/app/actions/index"
import Link from "next/link"
import { FiMail, FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi"

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
      const result = await sendPasswordReset(data.email)
      if (result.success) {
        setMessage("If an account exists with this email, you'll receive a password reset link shortly.")
      } else {
        setError(result.error || "Something went wrong. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black to-gray-900 p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo Placeholder */}
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">TF</span>
          </div>
        </div>

        <div className="bg-black bg-opacity-80 backdrop-blur-sm rounded-xl border border-gray-800 shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white">Reset Password</h2>
              <p className="text-gray-400 mt-2">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="flex items-center space-x-2 p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-200">
                    <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
                
                {message && (
                  <div className="flex items-center space-x-2 p-4 bg-green-900/50 border border-green-800 rounded-lg text-green-200">
                    <FiCheckCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{message}</p>
                  </div>
                )}

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
                            className="bg-gray-900 border-gray-700 text-white pl-10 focus:border-red-600 focus:ring-red-600"
                            placeholder="you@example.com"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </Form>

            <div className="mt-6">
              <Link 
                href="/sign-in" 
                className="flex items-center justify-center text-sm text-gray-400 hover:text-white transition-colors"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
          
          <div className="px-8 py-4 bg-gray-900 border-t border-gray-800">
            <p className="text-center text-xs text-gray-500">
              Need help? <a href="#" className="text-red-500 hover:text-red-400">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}