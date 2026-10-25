import { NextResponse, type NextRequest } from "next/server"

import { REFRESH_COOKIE } from "@/lib/auth/cookies"
import { djangoFetch } from "@/server/django"
import { clearSession } from "@/server/session"

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value
  if (refresh) {
    // Blacklist the refresh token server-side; the session is cleared locally regardless.
    await djangoFetch("users/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    }).catch(() => undefined)
  }

  const response = new NextResponse(null, { status: 204 })
  clearSession(response.cookies)
  return response
}
