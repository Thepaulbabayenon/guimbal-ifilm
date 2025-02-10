"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import React from "react";

export default function RestrictedPage() {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center">
      <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
      <p className="text-lg text-gray-700">
        You do not have permission to access this page.
      </p>
      <Link href="/">
        <Button className="mt-4">Go Back to Home</Button>
      </Link>
    </div>
  );
}
