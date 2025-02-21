"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import React from "react";

export default function RestrictedPage() {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-lg text-red-600">
        You do not have permission to access this page.
      </p>
      <p className="text-lg text-gray-500">
        Contact <span className="text-blue-800">pbabayen-on@usa.edu.ph</span> for administrative privileges 
      </p>
      <Link href="/">
        <Button className="mt-4">Go Back to Home</Button>
      </Link>
    </div>
  );
}

