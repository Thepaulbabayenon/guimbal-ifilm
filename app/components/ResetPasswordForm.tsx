"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()

  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email") || ""
  const router = useRouter()

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  })

  async function onSubmit(data: z.infer<typeof resetPasswordSchema>) {
    setIsLoading(true)
    setError(undefined)
    setMessage(undefined)
  
    if (!token) {
      setError("Invalid or expired password reset link.")
      setIsLoading(false)
      return
    }
  
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password: data.password }),
      })
  
      const result = await response.json()
  
      if (!response.ok) {
        throw new Error(result.error || "Failed to reset password.")
      }
  
      setMessage("Password reset successful! Redirecting to sign in...")
      setTimeout(() => router.push("/sign-in"), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="w-full max-w-md mx-auto p-8 space-y-8 bg-black bg-opacity-80 rounded-md border border-gray-800">
      <h2 className="text-3xl font-bold text-white text-center">Reset Password</h2>

      {error && <div className="p-3 bg-red-900 text-red-200 border border-red-800 rounded">{error}</div>}
      {message && <div className="p-3 bg-green-900 text-green-200 border border-green-800 rounded">{message}</div>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">New Password</FormLabel>
                <FormControl>
                  <Input type="password" disabled={isLoading} {...field} className="bg-gray-800 border-gray-700 text-white" />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white py-2">
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Form>

      <div className="text-center mt-6 text-sm text-gray-400">
        <a href="/sign-in" className="text-red-600 hover:text-red-500">
          Back to Sign In
        </a>
      </div>
    </div>
  )
}
