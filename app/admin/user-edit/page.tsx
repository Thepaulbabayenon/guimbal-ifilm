'use client';

export const dynamic = "force-dynamic"; // Force dynamic rendering

import { useState, useEffect } from 'react';
import { useUser } from "@/app/auth/nextjs/useUser";
import { redirect } from "next/navigation";
import UserEditForm, { UserFormData } from "../components/UserEditForm";

function UserEditPageContent({ params }: { params?: { id?: string } }) {
  const { user: currentUser, isLoading, isAuthenticated } = useUser();
  const [userData, setUserData] = useState<Partial<UserFormData> | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const userId = params?.id;
  const isEditMode = userId && userId !== "new";

  useEffect(() => {
    // Check authentication and permissions
    if (!isLoading && (!isAuthenticated || currentUser?.role !== "admin")) {
      redirect("/");
    }

    // Fetch user data for edit mode
    const fetchUserData = async () => {
      if (isEditMode && currentUser?.role === "admin") {
        try {
          const response = await fetch(`/api/users/${userId}`);
          
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const user = await response.json();
          
          setUserData({
            name: user.name || "",
            email: user.email,
            role: user.role as "admin" | "user",
          });
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to load user data");
        }
      }
    };

    fetchUserData();
  }, [isLoading, isAuthenticated, currentUser, isEditMode, userId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Access denied
  if (!isAuthenticated || currentUser?.role !== "admin") {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-xl font-bold text-red-700">Access Restricted</h2>
        <p className="mt-2 text-red-600">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-xl font-bold text-red-700">Error</h2>
        <p className="mt-2 text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <UserEditForm 
      userId={isEditMode ? userId : undefined} 
      initialData={userData} 
    />
  );
}

export default function UserEditPage({ params }: { params?: { id?: string } }) {
  return <UserEditPageContent params={params} />;
}