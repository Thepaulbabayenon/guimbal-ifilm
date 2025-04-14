"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button
import React from "react";
import { FiLock, FiHome } from "react-icons/fi"; // Add icons

export default function RestrictedPage() {
  return (
    // Apply dark theme background
    <div className="min-h-screen flex flex-col justify-center items-center text-center bg-gray-900 text-white p-4">
        <FiLock className="text-red-500 text-6xl mb-6" /> {/* Larger Icon */}
        <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-lg text-gray-300 mb-2">
            You do not have the necessary permissions to view this page.
        </p>
        <p className="text-sm text-gray-400 mb-8">
            If you believe this is an error, please contact the site administrator at
             {/* Using the student email from the thesis */}
            <a href="mailto:pbabayen-on@usa.edu.ph" className="text-red-400 hover:text-red-300 underline ml-1">
                pbabayen-on@usa.edu.ph
            </a>.
        </p>
        <Link href="/">
            {/* Themed button */}
            <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg inline-flex items-center transition-colors">
                <FiHome className="mr-2"/>
                Go Back to Home
            </Button>
      </Link>
    </div>
  );
}