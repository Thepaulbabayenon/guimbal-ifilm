'use client';

export const dynamic = "force-dynamic"; // Force dynamic rendering

import { useState, useEffect } from 'react';
import { useUser } from "@/app/auth/nextjs/useUser";
import { redirect } from "next/navigation";
import UserEditForm, { UserFormData } from "../components/UserEditForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

function UserEditPageContent({ params }: { params?: { id?: string } }) {
  const { user: currentUser, isLoading, isAuthenticated } = useUser();
  const [userData, setUserData] = useState<Partial<UserFormData> | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

  const userId = params?.id;
  const isEditMode = userId && userId !== "new";
  const pageTitle = isEditMode ? "Edit User" : "Create New User";

  useEffect(() => {
    // Check authentication and permissions
    if (!isLoading && (!isAuthenticated || currentUser?.role !== "admin")) {
      redirect("/");
    }

    // Fetch user data for edit mode
    const fetchUserData = async () => {
      if (isEditMode && currentUser?.role === "admin") {
        setIsDataLoading(true);
        try {
          const response = await fetch(`/api/users/${userId}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch user data (${response.status})`);
          }

          const user = await response.json();
          
          setUserData({
            name: user.name || "",
            email: user.email,
            role: user.role as "admin" | "user",
          });
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError(err instanceof Error ? err.message : "Failed to load user data");
        } finally {
          setIsDataLoading(false);
        }
      }
    };

    if (!isLoading && isAuthenticated && currentUser?.role === "admin") {
      fetchUserData();
    }
  }, [isLoading, isAuthenticated, currentUser, isEditMode, userId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
      </div>
    );
  }

  // Access denied
  if (!isAuthenticated || currentUser?.role !== "admin") {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-red-50 border border-red-200 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-red-700">Access Restricted</h2>
        <p className="mt-3 text-red-600">
          You don't have permission to access this page. Only administrators can manage users.
        </p>
        <Link href="/" className="inline-flex items-center mt-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:px-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/users" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to Users</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="mt-1 text-gray-500">
            {isEditMode ? "Update user details" : "Add a new user to the system"}
          </p>
        </div>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-red-700">Error</h2>
          <p className="mt-2 text-red-600">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
          >
            Dismiss
          </button>
        </div>
      ) : isDataLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-100 rounded-lg shadow-sm">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 md:p-8">
            <UserEditForm 
              userId={isEditMode ? userId : undefined} 
              initialData={userData}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserEditPage({ params }: { params?: { id?: string } }) {
  return <UserEditPageContent params={params} />;
}