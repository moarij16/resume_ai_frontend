import "server-only"

import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies"
import { env } from "./env"

export interface TokenPair {
  access: string
  refresh: string
}

/** Minimal cookie-writer contract satisfied by both `cookies()` and `NextResponse.cookies`. */
export interface CookieWriter {
  set(name: string, value: string, options: CookieOptions): unknown
  delete(name: string): unknown
}

interface CookieOptions {
  httpOnly: boolean
  secure: boolean
  sameSite: "lax"
  path: string
  maxAge: number
}

const FALLBACK_ACCESS_MAX_AGE = 15 * 60
const FALLBACK_REFRESH_MAX_AGE = 7 * 24 * 60 * 60

/** Seconds until the JWT's `exp` claim (signature is not verified — Django does that). */
export function secondsUntilExpiry(token: string, fallback: number): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"))
    if (typeof payload.exp !== "number") return fallback
    return Math.max(0, payload.exp - Math.floor(Date.now() / 1000))
  } catch {
    return fallback
  }
}

function cookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  }
}

export function writeSession(cookies: CookieWriter, tokens: TokenPair) {
  cookies.set(
    ACCESS_COOKIE,
    tokens.access,
    cookieOptions(secondsUntilExpiry(tokens.access, FALLBACK_ACCESS_MAX_AGE))
  )
  cookies.set(
    REFRESH_COOKIE,
    tokens.refresh,
    cookieOptions(secondsUntilExpiry(tokens.refresh, FALLBACK_REFRESH_MAX_AGE))
  )
}

export function clearSession(cookies: CookieWriter) {
  cookies.delete(ACCESS_COOKIE)
  cookies.delete(REFRESH_COOKIE)
}
