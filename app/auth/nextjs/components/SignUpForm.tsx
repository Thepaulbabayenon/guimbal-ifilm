"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel
} from "@/components/ui/form";
import { oAuthSignIn, signUp } from "../actions";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signUpSchema } from "@/app/db/schema";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaDiscord, FaGithub } from "react-icons/fa";
import { User, Mail, Lock, AtSign, ChevronRight, AlertCircle, CheckCircle, EyeOff, Eye } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { GlowEffect } from '@/components/motion-primitives/glow-effect';

// Custom error types for better error handling
type ErrorType = "validation" | "auth" | "server" | "network" | "unknown";

interface ErrorState {
  type: ErrorType;
  message: string;
  fieldErrors?: Record<string, string>;
}

const resolver = async (data: any) => {
  const result = signUpSchema.safeParse(data);
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

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<ErrorState | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
   const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      username: "",
    },
  });

  const clearNotifications = () => {
    setError(null);
    setSuccess(null);
  };

  const handleError = (errorMsg: string): ErrorState => {
    // Parse the error message to determine the type
    if (errorMsg.includes("already exists") || errorMsg.includes("already taken")) {
      return {
        type: "validation" as ErrorType,
        message: errorMsg,
      };
    } else if (errorMsg.includes("connect") || errorMsg.includes("timeout")) {
      return {
        type: "network" as ErrorType,
        message: "Connection issue. Please check your internet connection and try again.",
      };
    } else if (errorMsg.includes("server")) {
      return {
        type: "server" as ErrorType,
        message: "Our servers are experiencing issues. Please try again later.",
      };
    } else {
      return {
        type: "unknown" as ErrorType,
        message: "An unexpected error occurred. Please try again or contact support.",
      };
    }
  };

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    clearNotifications();
    setLoading(true);

    try {
      const result = await signUp(data);

      if (typeof result === "string") {
        setError(handleError(result));
      } else {
        setSuccess("Sign-up successful! Redirecting to your dashboard...");
        
        // Wait before redirecting to allow user to see success message
        setTimeout(() => {
          router.push("/home");
        }, 2000);
      }
    } catch (err) {
      setError({
        type: "unknown",
        message: "An unexpected error occurred during sign-up. Please try again.",
      });
      console.error("Sign-up error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github" | "discord") => {
    clearNotifications();
    setLoading(true);
    
    try {
      const result = await oAuthSignIn(provider);
      
      if (result.success && result.authUrl) {
        window.location.href = result.authUrl;
      } else {
        setError({
          type: "auth",
          message: result.error || `Failed to initiate ${provider} sign-in. Please try again.`,
        });
      }
    } catch (err) {
      console.error(`${provider} OAuth error:`, err);
      setError({
        type: "network",
        message: `Unable to connect to ${provider}. Please check your connection and try again.`,
      });
    } finally {
      setLoading(false);
    }
  };

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

    return (
      <Alert className={`${errorStyles[error.type]} p-4 rounded-xl animate-fade-in transition-all`}>
        <div className="flex items-center gap-2">
          {errorIcons[error.type]}
          <AlertTitle className="font-medium">
            {error.type === "validation" && "Please check your information"}
            {error.type === "auth" && "Authentication Error"}
            {error.type === "server" && "Server Issue"}
            {error.type === "network" && "Connection Problem"}
            {error.type === "unknown" && "Something went wrong"}
          </AlertTitle>
        </div>
        <AlertDescription className="mt-1">{error.message}</AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-red-900/20 opacity-70 pointer-events-none"></div>

      {/* Sign-Up Form Container */}
      <div className="relative w-full max-w-lg p-10 bg-black/85 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-800/50 z-10 transition-all duration-500 hover:shadow-red-900/50">
        {/* Animated Glow Effect */}
        <div className="absolute -inset-0.5 bg-red-600/20 rounded-2xl blur-lg opacity-50 animate-pulse"></div>

        <div className="relative z-20 space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
              Create Account
            </h2>
            <p className="text-gray-400 text-sm tracking-wide">
              Join <span className="text-yellow-500">Thebantayanfilmfestival</span>
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
              {/* OAuth Buttons */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { 
                    provider: "google", 
                    icon: <FcGoogle className="text-2xl" />,
                    label: "Google",
                    colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335']
                  },
                  { 
                    provider: "github", 
                    icon: <FaGithub className="text-2xl" />,
                    label: "GitHub",
                    colors: ['#6e5494', '#4078c0', '#6cc644', '#bd2c00']
                  },
                  { 
                    provider: "discord", 
                    icon: <FaDiscord className="text-2xl" />,
                    label: "Discord",
                    colors: ['#5865F2', '#99AAB5', '#2C2F33', '#7289DA']
                  }
                ].map(({ provider, icon, label, colors }) => (
                  <div key={provider} className="relative">
                    <GlowEffect
                      colors={colors}
                      mode="colorShift"
                      blur="soft"
                      duration={4}
                      scale={0.9}
                    />
                    <Button
                      type="button"
                      onClick={() => handleOAuthSignIn(provider as "google" | "github" | "discord")}
                      disabled={loading}
                      aria-label={`Sign up with ${label}`}
                      className="relative w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 bg-gray-800/80 text-white backdrop-blur-sm"
                    >
                      {icon}
                    </Button>
                  </div>
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
                {/* Full Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Full Name</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="text" 
                            disabled={loading} 
                            {...field} 
                            className="pl-10 bg-gray-800 border-gray-700 text-white focus:border-red-600 focus:ring-red-600 transition-all duration-300" 
                            placeholder="Enter your full name"
                            aria-invalid={!!form.formState.errors.name}
                            onFocus={clearNotifications}
                          />
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

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

                {/* Username Field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 flex items-center space-x-2">
                        <AtSign className="w-4 h-4 text-gray-500" />
                        <span>Username</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="text" 
                            disabled={loading} 
                            {...field} 
                            className="pl-10 bg-gray-800 border-gray-700 text-white focus:border-red-600 focus:ring-red-600 transition-all duration-300" 
                            placeholder="Choose a username"
                            aria-invalid={!!form.formState.errors.username}
                            onFocus={clearNotifications}
                          />
                          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
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

              {/* Submit Button with Glow Effect */}
              <div className="relative">
                <GlowEffect
                  colors={['#FF5733', '#FF0000', '#CD5C5C', '#B22222']}
                  mode="colorShift"
                  blur="medium"
                  duration={5}
                  scale={1}
                />
                <Button
                  type="submit"
                  className="relative w-full bg-red-600 hover:bg-red-700 p-4 text-lg font-semibold rounded-lg flex justify-center items-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing Up...
                    </div>
                  ) : (
                    <>
                      Create Account
                      <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
                    </>
                  )}
                </Button>
              </div>

              {/* Sign In Link */}
              <p className="text-gray-400 text-center mt-4 text-sm">
                Already have an account?{" "}
                <Link 
                  href="/sign-in" 
                  className="text-red-500 hover:underline transition-colors font-medium flex items-center justify-center gap-1 group"
                >
                  Sign In
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}