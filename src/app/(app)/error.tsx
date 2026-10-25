"use client"

import { ErrorState } from "@/components/shared/states"

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorState error={error} onRetry={reset} />
}
