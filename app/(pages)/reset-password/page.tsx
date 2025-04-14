"use client" // Keep client directive if ResetPasswordForm uses client-side hooks

import { Suspense } from "react"
// Assuming ResetPasswordForm is the actual form component you want to render
import ResetPasswordForm from "@/app/components/Modal/ResetPasswordForm" // Adjust path as needed

export default function ResetPasswordPage() {
  return (
     // Apply the consistent background gradient used in ForgotPasswordPage
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-900 p-4">
        <Suspense fallback={
            <div className="text-center">
                <p className="text-gray-400 text-lg">Loading Form...</p>
                 {/* Optional: Add a spinner */}
            </div>
        }>
            {/* The actual form component is rendered here */}
            <ResetPasswordForm />
        </Suspense>
    </div>
  )
}