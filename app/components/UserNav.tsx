'use client';

import React from "react";
import Link from "next/link";
import { useAuth } from "@/app/auth/nextjs/useUser";
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


const UserNav: React.FC = () => {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  console.log("User data:", user);

  const isAdmin = user?.role === "admin";

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="animate-spin text-black" />
      </div>
    );
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-transparent shadow text-muted-foreground cursor-pointer">
      <div>
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-sm">
                <Avatar className="h-10 w-10 rounded-sm">
                  <AvatarImage src={user?.image || "/default-avatar.svg"} alt={user.name || "User"} />
                  <AvatarFallback className="rounded-sm">
                    {user.name ? user.name[0] : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1 ">
                  <Link href="/home/user">
                    <p className="text-sm font-extrabold leading-none focus:underline-offset-2">
                      {user.name || "Thebantayanfilmfestival User"}
                    </p>
                  </Link>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email || "user@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/home/user/recommended">
                <DropdownMenuItem className="cursor-pointer">Recommended Films</DropdownMenuItem>
              </Link>
              {isAdmin ? (
                <Link href="/admin">
                  <DropdownMenuItem className="cursor-pointer focus:text-blue-600">Admin</DropdownMenuItem>
                </Link>
              ) : (
                <Link href="/restricted">
                  <DropdownMenuItem className="text-red-500 cursor-pointer">Admin</DropdownMenuItem>
                </Link>
              )}
              <Link href="/home/user/favorites">
                <DropdownMenuItem className="cursor-pointer">
                  Your Favorites
                </DropdownMenuItem>
              </Link>
              <Link href="/home/filmmakers">
                <DropdownMenuItem className="cursor-pointer">
                  Behind The Scences!
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem 
          onClick={handleSignOut} 
          className="hover:text-red-800 focus:text-red-800 cursor-pointer"
        >
          Log Out
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