import type { Metadata } from "next"
import { Suspense } from "react"

import { LoginForm } from "@/features/auth/components/login-form"

export const metadata: Metadata = { title: "Sign in" }

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Sign in to continue to your dashboard.</p>
      </div>
      {/* useSearchParams (for ?next=) requires a Suspense boundary under Cache Components. */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
