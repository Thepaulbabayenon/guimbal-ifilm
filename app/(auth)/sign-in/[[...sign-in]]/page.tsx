import Image from "next/image";
import { Loader2 } from "lucide-react";
import { SignIn, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-full flex flex-col items-center justify-center px-4 lg:w-1/2">
        <div className="text-center space-y-4">
          <h1 className="font-bold text-3xl text-black">
            Welcome Back!
          </h1> 
        </div>
        <div className="flex items-center justify-center mt-8">
          <ClerkLoaded>
            <SignIn path="/sign-in" />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className="animate-spin text-black" />
          </ClerkLoading>
        </div>
      </div>
    </div>
  );
}
