import { NextResponse, type NextRequest } from "next/server"

import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies"
import { djangoFetch } from "@/server/django"
import { forwardWithRefresh } from "@/server/forward"
import { clearSession, writeSession } from "@/server/session"
import { refreshTokens } from "@/server/token-refresher"

// AI generation runs synchronously on the backend; match its 60s function limit.
export const maxDuration = 60

const FORWARDED_REQUEST_HEADERS = ["content-type", "accept"]
const FORWARDED_RESPONSE_HEADERS = ["content-type", "content-disposition", "cache-control"]

/** Token-handling endpoints are only reachable through `/api/auth/*`. */
const BLOCKED_PREFIX = "users/auth"

function unauthorized() {
  const response = NextResponse.json(
    { error: true, status_code: 401, detail: { detail: "Authentication required." } },
    { status: 401 }
  )
  clearSession(response.cookies)
  return response
}

async function handler(request: NextRequest, ctx: RouteContext<"/api/proxy/[...path]">) {
  const { path } = await ctx.params
  const target = path.join("/")

  if (
    path.some((segment) => segment === ".." || segment === ".") ||
    target.startsWith(BLOCKED_PREFIX)
  ) {
    return NextResponse.json({ error: "Not found." }, { status: 404 })
  }

  const headers = new Headers()
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  // Buffer the body so the request can be replayed after a token refresh.
  const hasBody = !["GET", "HEAD"].includes(request.method)
  const body = hasBody ? await request.arrayBuffer() : undefined

  const result = await forwardWithRefresh(
    {
      access: request.cookies.get(ACCESS_COOKIE)?.value,
      refresh: request.cookies.get(REFRESH_COOKIE)?.value,
    },
    {
      refresh: refreshTokens,
      send: (accessToken) => {
        headers.set("authorization", `Bearer ${accessToken}`)
        return djangoFetch(
          target,
          { method: request.method, headers, body },
          request.nextUrl.search
        )
      },
    }
  )

  if (result.kind === "expired") return unauthorized()

  const { response: upstream, rotated } = result
  const responseHeaders = new Headers()
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name)
    if (value) responseHeaders.set(name, value)
  }

  const response = new NextResponse(upstream.status === 204 ? null : upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })
  if (rotated) writeSession(response.cookies, rotated)
  return response
}

export { handler as DELETE, handler as GET, handler as PATCH, handler as POST, handler as PUT }
