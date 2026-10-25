import "server-only"

import { djangoFetch } from "./django"
import type { TokenPair } from "./session"

export type RefreshFn = (refreshToken: string) => Promise<TokenPair | null>

/**
 * Django rotates refresh tokens and blacklists the old one. When several
 * requests race to refresh with the same token, only the first would succeed
 * and the rest would log the user out. We share one in-flight refresh per
 * token and keep its result briefly so late arrivals reuse the new pair.
 */
export function createDedupedRefresher(refresh: RefreshFn, ttlMs = 30_000): RefreshFn {
  const cache = new Map<string, { promise: Promise<TokenPair | null>; expiresAt: number }>()

  return (refreshToken) => {
    const now = Date.now()
    for (const [key, entry] of cache) if (entry.expiresAt <= now) cache.delete(key)

    const cached = cache.get(refreshToken)
    if (cached) return cached.promise

    const promise = refresh(refreshToken).catch(() => null)
    cache.set(refreshToken, { promise, expiresAt: now + ttlMs })
    return promise
  }
}

async function refreshWithDjango(refreshToken: string): Promise<TokenPair | null> {
  const response = await djangoFetch("users/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  })
  if (!response.ok) return null
  const data = (await response.json()) as Partial<TokenPair>
  if (!data.access) return null
  // With rotation enabled Django always returns a new refresh token.
  return { access: data.access, refresh: data.refresh ?? refreshToken }
}

export const refreshTokens = createDedupedRefresher(refreshWithDjango)
