"use client"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { oAuthSignIn, signIn } from "../actions"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { signInSchema } from "@/app/db/schema"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FcGoogle } from "react-icons/fc"
import { FaDiscord, FaGithub } from "react-icons/fa"
import { User, Mail, Lock, ChevronRight } from "lucide-react"

const resolver = async (data: any) => {
  const result = signInSchema.safeParse(data);
  if (result.success) {
    return { values: result.data, errors: {} };
  } else {
    const errors = result.error.format();
    const formattedErrors: Record<string, { message: string }> = {};

    for (const field of Object.keys(errors)) {
      const errorData = errors[field as keyof typeof errors];

      if (Array.isArray(errorData)) {
        formattedErrors[field] = { message: errorData.join(", ") };
      } else if (errorData && "_errors" in errorData) {
        formattedErrors[field] = { message: errorData._errors.join(", ") };
      }
    }

    return { values: {}, errors: formattedErrors };
  }
};

export function SignInForm() {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver,
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: z.infer<typeof signInSchema>) {
    setError(undefined)
    setSuccess(undefined)
    setLoading(true)

    try {
      const result = await signIn(data)

      if (result.success) {
        setSuccess("Sign-in successful! Redirecting...")
        setTimeout(() => router.push("/home"), 2000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-red-900/20 opacity-70 pointer-events-none"></div>

      {/* Sign-In Form Container */}
      <div className="relative w-full max-w-lg p-10 bg-black/85 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-800/50 z-10 transition-all duration-500 hover:shadow-red-900/50">
        {/* Animated Glow Effect */}
        <div className="absolute -inset-0.5 bg-red-600/20 rounded-2xl blur-lg opacity-50 animate-pulse"></div>

        <div className="relative z-20 space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
              Welcome Back
            </h2>
            <p className="text-gray-400 text-sm tracking-wide">
              Sign in to access your account
            </p>
          </div>

          {/* Notification Area */}
          {error && (
            <div className="bg-red-900/50 border border-red-800 text-red-200 p-4 rounded-xl text-center animate-shake transition-all">
              <div className="flex items-center justify-center gap-2">
                <span className="text-red-400">!</span>
                {error}
              </div>
            </div>
          )}
          {success && (
            <div className="bg-green-900/50 border border-green-800 text-green-200 p-4 rounded-xl text-center animate-bounce transition-all">
              {success}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* OAuth Buttons */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { 
                    provider: "google", 
                    icon: <FcGoogle className="text-2xl" />
                  },
                  { 
                    provider: "github", 
                    icon: <FaGithub className="text-2xl" />
                  },
                  { 
                    provider: "discord", 
                    icon: <FaDiscord className="text-2xl" />
                  }
                ].map(({ provider, icon }) => (
                  <Button
                    key={provider}
                    type="button"
                    onClick={() => oAuthSignIn(provider as "google" | "github" | "discord")}
                    className="flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 bg-gray-800 text-white"
                  >
                    {icon}
                  </Button>
                ))}
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-black text-gray-400 tracking-wide">Or continue with email</span>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>Email</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="email" 
                            disabled={loading} 
                            {...field} 
                            className="pl-10 bg-gray-800 border-gray-700 text-white focus:border-red-600 focus:ring-red-600 transition-all duration-300" 
                            placeholder="Enter your email"
                          />
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="text-gray-300 flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-gray-500" />
                          <span>Password</span>
                        </FormLabel>
                        <Link 
                          href="/forgot-password" 
                          className="text-red-500 hover:underline text-xs transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="password" 
                            disabled={loading} 
                            {...field} 
                            className="pl-10 bg-gray-800 border-gray-700 text-white focus:border-red-600 focus:ring-red-600 transition-all duration-300" 
                            placeholder="••••••••"
                          />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 p-4 text-lg font-semibold rounded-lg flex justify-center items-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
                  </>
                )}
              </Button>

              {/* Sign Up Link */}
              <p className="text-gray-400 text-center mt-4 text-sm">
                Don't have an account?{" "}
                <Link 
                  href="/sign-up" 
                  className="text-red-500 hover:underline transition-colors font-medium flex items-center justify-center gap-1 group"
                >
                  Sign Up
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}