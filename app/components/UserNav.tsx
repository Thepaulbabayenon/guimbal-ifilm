'use client';

import React from "react";
import Link from "next/link";
import { useUser } from "@/app/auth/nextjs/useUser"; // Updated import path
import { Loader2 } from "lucide-react";
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
import { LogOutButton } from "../auth/nextjs/components/LogOutButton";

const UserNav = () => {
  const { user, isLoading, isAuthenticated } = useUser();

      console.log("User data:", user); 

  

  const isAdmin = user?.role === "admin";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="animate-spin text-black" />
      </div>
    );
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-transparent shadow text-muted-foreground">
      <div>
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-sm">
                <Avatar className="h-10 w-10 rounded-sm">
                  <AvatarImage src={user?.imageUrl || ""} alt={user.name || "User"} />
                  <AvatarFallback className="rounded-sm">
                    {user.name ? user.name[0] : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <Link href="/home/user">
                    <p className="text-sm font-medium leading-none">
                      {user.name || "User Name"}
                    </p>
                  </Link>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email || "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/home/user/recommended">
                <DropdownMenuItem>Recommended Films</DropdownMenuItem>
              </Link>
              {isAdmin ? (
                <Link href="/admin">
                  <DropdownMenuItem>Admin</DropdownMenuItem>
                </Link>
              ) : (
                <Link href="/restricted">
                  <DropdownMenuItem className="text-red-500">Admin</DropdownMenuItem>
                </Link>
              )}
              <DropdownMenuItem >
                <LogOutButton />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center space-x-4">
            <Link href="/sign-in">
              <Button variant="default" className="px-4 py-2">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" className="px-4 py-2">Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default UserNav;