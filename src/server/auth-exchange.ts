import "server-only"

import { NextResponse } from "next/server"

import { djangoFetch, readJson } from "./django"
import { writeSession, type TokenPair } from "./session"

interface DjangoAuthPayload extends Partial<TokenPair> {
  user?: unknown
}

/**
 * Forwards credentials to a Django auth endpoint (login/register). On success
 * the JWT pair is stored in httpOnly cookies and only the user is returned —
 * tokens never reach browser JavaScript.
 */
export async function exchangeCredentials(djangoPath: string, request: Request) {
  const upstream = await djangoFetch(djangoPath, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: await request.text(),
  })
  const payload = (await readJson(upstream)) as DjangoAuthPayload | null

  if (!upstream.ok || !payload?.access || !payload.refresh) {
    return NextResponse.json(payload ?? { error: "Authentication failed." }, {
      status: upstream.ok ? 502 : upstream.status,
    })
  }

  const response = NextResponse.json({ user: payload.user }, { status: upstream.status })
  writeSession(response.cookies, { access: payload.access, refresh: payload.refresh })
  return response
}
