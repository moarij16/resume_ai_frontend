"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "next-themes"
import { useState, type ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { createBrowserApi } from "@/lib/api"
import { ApiProvider } from "@/lib/api-context"
import { createQueryClient } from "@/lib/query-client"

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [queryClient] = useState(createQueryClient)
  const [api] = useState(() =>
    // The BFF has already cleared the session cookies when it returns 401.
    createBrowserApi(() => {
      const { pathname, search } = window.location
      if (pathname.startsWith("/login")) return
      queryClient.clear()
      router.replace(`/login?next=${encodeURIComponent(`${pathname}${search}`)}`)
    })
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <ApiProvider api={api}>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ApiProvider>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
