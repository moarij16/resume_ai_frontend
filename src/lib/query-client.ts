import { MutationCache, QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage, isApiError } from "@/lib/http/errors"

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** Skip the global error toast (e.g. forms that render errors inline). */
      silent?: boolean
      successMessage?: string
    }
  }
}

function shouldRetry(failureCount: number, error: unknown) {
  if (isApiError(error) && error.status < 500) return false
  return failureCount < 2
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
    mutationCache: new MutationCache({
      onSuccess: (_data, _vars, _ctx, mutation) => {
        const message = mutation.meta?.successMessage
        if (message) toast.success(message)
      },
      onError: (error, _vars, _ctx, mutation) => {
        if (mutation.meta?.silent) return
        if (isApiError(error) && error.isUnauthorized) return
        toast.error(getErrorMessage(error))
      },
    }),
  })
}
