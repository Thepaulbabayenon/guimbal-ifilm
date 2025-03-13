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
import { User, Mail, ChevronRight, AlertCircle, CheckCircle, Lock, Eye, EyeOff} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { GlowEffect } from '@/components/motion-primitives/glow-effect'
import { ButtonHTMLAttributes, ReactNode } from 'react'

// Custom error types for better error handling
type ErrorType = "validation" | "auth" | "server" | "network" | "unknown";

interface ErrorState {
  type: ErrorType;
  message: string;
  fieldErrors?: Record<string, string>;
}

// Define the available modes for GlowEffect
type GlowMode = "colorShift" | "rotate" | "pulse" | "breathe" | "flowHorizontal" | "static";

// Define the available blur strengths
type BlurStrength = "none" | "softest" | "soft" | "medium" | "strong" | "stronger" | "strongest" | number;

// Props interface for EnhancedGlowButton
interface EnhancedGlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  colors?: string[];
  disabled?: boolean;
  mode?: GlowMode;
  blur?: BlurStrength;
  duration?: number;
  scale?: number;
}

// Enhanced Glow Button Component with new GlowEffect
function EnhancedGlowButton({ 
  children, 
  className = "", 
  colors = ["#ff0000", "#ff3333", "#ff6666", "#ff9999"], 
  disabled = false,
  onClick,
  type = "button",
  mode = "colorShift",
  blur = "soft",
  duration = 3,
  scale = 0.9,
  ...props 
}: EnhancedGlowButtonProps) {
  return (
    <div className="relative group">
      {/* New GlowEffect Component */}
      {!disabled && (
        <GlowEffect
          colors={colors}
          mode={mode}
          blur={blur}
          duration={duration}
          scale={scale}
        />
      )}
      
      <button
        type={type}
        className={`relative ${className} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    </div>
  );
}

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
  const [error, setError] = useState<ErrorState | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter()
  
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver,
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const clearNotifications = () => {
    setError(null);
    setSuccess(null);
  };

  const handleError = (errorMsg: string): ErrorState => {
    // Parse the error message to determine the type
    if (errorMsg.toLowerCase().includes("invalid credentials") || 
        errorMsg.toLowerCase().includes("incorrect password") ||
        errorMsg.toLowerCase().includes("user not found")) {
      return {
        type: "auth",
        message: "The email or password you entered is incorrect.",
      };
    } else if (errorMsg.toLowerCase().includes("many attempts") || 
               errorMsg.toLowerCase().includes("locked")) {
      return {
        type: "auth",
        message: "Too many failed attempts. Please try again later or reset your password.",
      };
    } else if (errorMsg.toLowerCase().includes("connect") || 
               errorMsg.toLowerCase().includes("timeout")) {
      return {
        type: "network",
        message: "Connection issue. Please check your internet connection and try again.",
      };
    } else if (errorMsg.toLowerCase().includes("server")) {
      return {
        type: "server",
        message: "Our servers are experiencing issues. Please try again later.",
      };
    } else {
      return {
        type: "unknown",
        message: "An unexpected error occurred. Please try again or contact support.",
      };
    }
  };

  async function onSubmit(data: z.infer<typeof signInSchema>) {
    clearNotifications()
    setLoading(true)

    try {
      const result = await signIn(data)

      if (result.success) {
        setSuccess("Sign-in successful! Redirecting...")
        setTimeout(() => router.push("/home"), 2000)
      } else {
        setError(handleError(result.error))
      }
    } catch (err) {
      console.error("Sign-in error:", err)
      setError({
        type: "unknown",
        message: "An unexpected error occurred during sign-in. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle OAuth sign-in with redirect
  const handleOAuthSignIn = async (provider: "google" | "github" | "discord") => {
    clearNotifications()
    setLoading(true)
    
    try {
      const result = await oAuthSignIn(provider)
      
      if (result.success && result.authUrl) {
        window.location.href = result.authUrl
      } else {
        setError({
          type: "auth",
          message: result.error || `Failed to initiate ${provider} sign-in. Please try again.`,
        })
      }
    } catch (err) {
      console.error(`${provider} OAuth error:`, err)
      setError({
        type: "network",
        message: `Unable to connect to ${provider}. Please check your connection and try again.`,
      })
    } finally {
      setLoading(false)
    }
  }

  // Error notification component based on error type
  const ErrorNotification = () => {
    if (!error) return null;

    const errorStyles = {
      validation: "bg-amber-900/50 border-amber-800 text-amber-200",
      auth: "bg-red-900/50 border-red-800 text-red-200",
      server: "bg-purple-900/50 border-purple-800 text-purple-200",
      network: "bg-blue-900/50 border-blue-800 text-blue-200",
      unknown: "bg-red-900/50 border-red-800 text-red-200",
    };

    const errorIcons = {
      validation: <AlertCircle className="h-5 w-5 text-amber-400" />,
      auth: <AlertCircle className="h-5 w-5 text-red-400" />,
      server: <AlertCircle className="h-5 w-5 text-purple-400" />,
      network: <AlertCircle className="h-5 w-5 text-blue-400" />,
      unknown: <AlertCircle className="h-5 w-5 text-red-400" />,
    };

    const errorTitles = {
      validation: "Please check your information",
      auth: "Authentication Error",
      server: "Server Issue",
      network: "Connection Problem",
      unknown: "Something went wrong",
    };

    return (
      <Alert className={`${errorStyles[error.type]} p-4 rounded-xl animate-fade-in transition-all`}>
        <div className="flex items-center gap-2">
          {errorIcons[error.type]}
          <AlertTitle className="font-medium">{errorTitles[error.type]}</AlertTitle>
        </div>
        <AlertDescription className="mt-1">{error.message}</AlertDescription>
      </Alert>
    );
  };

  // OAuth provider configuration with color schemes for glow effect
  const oAuthProviders = [
    { 
      provider: "google", 
      icon: <FcGoogle className="text-2xl" />,
      label: "Google",
      colors: ["#4285F4", "#34A853", "#FBBC05", "#EA4335"], // Google colors
      duration: 2.5,
      mode: "colorShift" as GlowMode,
      blur: "medium" as BlurStrength
    },
    { 
      provider: "github", 
      icon: <FaGithub className="text-2xl" />,
      label: "GitHub",
      colors: ["#2b3137", "#6e40c9", "#4078c0", "#24292e"], // GitHub-inspired colors
      duration: 3,
      mode: "colorShift" as GlowMode,
      blur: "medium" as BlurStrength
    },
    { 
      provider: "discord", 
      icon: <FaDiscord className="text-2xl" />,
      label: "Discord",
      colors: ["#5865F2", "#99AAB5", "#7289da", "#2c2f33"], // Discord colors
      duration: 3.5,
      mode: "colorShift" as GlowMode,
      blur: "medium" as BlurStrength
    }
  ];

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
          {error && <ErrorNotification />}
          
          {success && (
            <Alert className="bg-green-900/50 border border-green-800 text-green-200 p-4 rounded-xl animate-pulse transition-all">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <AlertTitle className="font-medium">Success</AlertTitle>
              </div>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* OAuth Buttons with Enhanced Glow Effect */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {oAuthProviders.map(({ provider, icon, label, colors, duration, mode, blur }) => (
                  <EnhancedGlowButton
                    key={provider}
                    type="button"
                    onClick={() => handleOAuthSignIn(provider as "google" | "github" | "discord")}
                    disabled={loading}
                    colors={colors}
                    duration={duration}
                    mode={mode}
                    blur={blur}
                    scale={0.85}
                    aria-label={`Sign in with ${label}`}
                    className="flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 bg-gray-800/90 text-white w-full"
                  >
                    {icon}
                  </EnhancedGlowButton>
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
                            aria-invalid={!!form.formState.errors.email}
                            onFocus={clearNotifications}
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
                                type={showPassword ? "text" : "password"}
                                disabled={loading}
                                {...field}
                                className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white focus:border-red-600 focus:ring-red-600 transition-all duration-300"
                                placeholder="••••••••"
                                aria-invalid={!!form.formState.errors.password}
                                onFocus={clearNotifications}
                              />
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
              </div>

              {/* Submit Button with Enhanced Glow Effect */}
              <EnhancedGlowButton
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 p-4 text-lg font-semibold rounded-lg flex justify-center items-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group"
                colors={["#ff0000", "#ff3333", "#ff6666", "#ff9999"]}
                mode="pulse"
                blur="soft"
                duration={2}
                scale={1}
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
              </EnhancedGlowButton>

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