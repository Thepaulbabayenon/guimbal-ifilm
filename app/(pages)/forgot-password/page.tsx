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

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
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
        setMessage("If an account exists, you'll receive a reset link.")
      } else {
        setError(result.error || "Something went wrong.")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto p-8 space-y-8 bg-black bg-opacity-80 rounded-md border border-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-1">Forgot Password?</h2>
          <p className="text-gray-400 text-sm">Enter your email to receive a reset link.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && <div className="p-3 bg-red-900 text-red-200 border border-red-800 rounded">{error}</div>}
            {message && <div className="p-3 bg-green-900 text-green-200 border border-green-800 rounded">{message}</div>}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      disabled={isLoading}
                      {...field}
                      className="bg-gray-800 border-gray-700 text-white focus:border-red-600 focus:ring-red-600"
                      placeholder="Enter your email"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white py-2">
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6 text-sm text-gray-400">
          <Link href="/sign-in" className="text-red-600 hover:text-red-500">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}