"use client";

import React, { Suspense } from "react";
import RecommendedPage from "@/app/components/RecommendedPage";

// Simple loading fallback
const RecommendationsLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
  </div>
);

export default function RecommendationsPageWrapper() {
  return (
    <main className="flex min-h-screen flex-col">
      <Suspense fallback={<RecommendationsLoading />}>
        <RecommendedPage/>
      </Suspense>
    </main>
  );
}