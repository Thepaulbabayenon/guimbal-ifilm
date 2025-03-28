'use client';

import { useAuth } from "@/app/auth/nextjs/useUser";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import UserManagementClient from "./UserManagementClient";

type UserWithRole = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "user";
  name?: string;
  emailAddresses: { emailAddress: string }[];
};

// This is a client component that can use the useAuth hook
const UserManagementWrapper = ({ users }: { users: UserWithRole[] }) => {
    const { user, isAuthenticated, isLoading } = useAuth({ withFullUser: true });
    
    useEffect(() => {
      // Client-side redirect if not authenticated
      if (!isLoading && !isAuthenticated) {
        window.location.href = "/sign-in";
      }
    }, [isLoading, isAuthenticated]);
    
    // Show loading state
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    // Check if user is admin
    const isAdmin = user?.role === "admin";
    
    // Show access denied if not admin
    if (!isAdmin) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700">Access Denied</h2>
          <p className="text-red-600 mt-2">
            You do not have administrative privileges to access this page.
          </p>
        </div>
      );
    }
    
    return (
      <UserManagementClient 
        users={users} 
        currentUserId={user?.id || ''} 
        isAdmin={isAdmin} 
      />
    );
  };
  
  export default UserManagementWrapper;