import { NextResponse, type NextRequest } from "next/server"

import { REFRESH_COOKIE } from "@/lib/auth/cookies"

const AUTH_ROUTES = ["/login", "/register"]

/**
 * Optimistic route protection: only checks for a session cookie. Django
 * remains the authority — an invalid token surfaces as a 401 from the BFF,
 * which sends the user back to /login.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hasSession = request.cookies.has(REFRESH_COOKIE)
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!isAuthRoute && !hasSession) {
    const login = new URL("/login", request.url)
    if (pathname !== "/") login.searchParams.set("next", `${pathname}${search}`)
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
