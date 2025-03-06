"use client"

import { Suspense, useState } from "react"
import ResetPasswordForm from "@/app/components/ResetPasswordForm"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-center text-gray-400">Loading...</p>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
