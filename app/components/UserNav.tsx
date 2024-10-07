// UserNav.tsx
"use client"; // Ensure this is present if using Next.js 13 with the app directory

import React from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react"; // Loading spinner
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const UserNav = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk(); // Access Clerk's signOut function

  if (!isLoaded) {
    // Loading state
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="animate-spin text-black" />
      </div>
    );
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-transparent shadow text-muted-foreground">
      <div>
        {isSignedIn && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-sm"
              >
                <Avatar className="h-10 w-10 rounded-sm">
                  <AvatarImage
                    src={user?.externalAccounts?.[0]?.imageUrl || ""}
                    alt={user.fullName || "User"}
                  />
                  <AvatarFallback className="rounded-sm">
                    {user.fullName ? user.fullName[0] : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              align="end"
              forceMount
            >
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <Link href="/home/user">
                    <p className="text-sm font-medium leading-none">
                      {user.fullName || "User Name"}
                    </p>
                  </Link>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.emailAddresses && user.emailAddresses.length > 0
                      ? user.emailAddresses[0].emailAddress
                      : "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center space-x-4">
            <Link href="/sign-in">
              <Button variant="default" className="px-4 py-2">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" className="px-4 py-2">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default UserNav;
