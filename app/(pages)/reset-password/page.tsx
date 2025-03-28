"use client"

import { Suspense } from "react"
import ResetPasswordForm from "@/app/components/Modal/ResetPasswordForm"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-center text-gray-400">Loading...</p>}>
      <div className="flex items-center justify-center min-h-screen">
        <ResetPasswordForm />
      </div>
    </Suspense>
  )
}
