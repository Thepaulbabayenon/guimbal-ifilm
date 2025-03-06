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
import { User, Mail, Lock, AtSign, ChevronRight } from "lucide-react";

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
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      username: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setError(undefined);
    setSuccess(undefined);
    setLoading(true);

    const result = await signUp(data);

    setLoading(false);

    if (typeof result === "string") {
      setError(result);
    } else {
      setSuccess("Sign-up successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/home";
      }, 2000);
    }
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
              Join our platform and unlock exclusive features
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
                    Signing Up...
                  </div>
                ) : (
                  <>
                    Create Account
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
                  </>
                )}
              </Button>

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