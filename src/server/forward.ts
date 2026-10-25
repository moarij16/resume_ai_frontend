import type { TokenPair } from "./session"
import type { RefreshFn } from "./token-refresher"

export interface SessionTokens {
  access?: string
  refresh?: string
}

export interface ForwardDeps {
  /** Performs the upstream request with the given access token. Must be safe to call twice. */
  send: (accessToken: string) => Promise<Response>
  refresh: RefreshFn
}

export type ForwardResult =
  { kind: "ok"; response: Response; rotated: TokenPair | null } | { kind: "expired" }

/**
 * Forwards a request with the caller's access token, transparently refreshing
 * once when the token is missing or rejected. Returns rotated tokens so the
 * caller can persist them — Django blacklists the previous refresh token.
 */
export async function forwardWithRefresh(
  session: SessionTokens,
  { send, refresh }: ForwardDeps
): Promise<ForwardResult> {
  let rotated: TokenPair | null = null
  let accessToken = session.access

  if (!accessToken) {
    if (!session.refresh) return { kind: "expired" }
    rotated = await refresh(session.refresh)
    if (!rotated) return { kind: "expired" }
    accessToken = rotated.access
  }

  let response = await send(accessToken)

  if (response.status === 401 && session.refresh && !rotated) {
    rotated = await refresh(session.refresh)
    if (!rotated) return { kind: "expired" }
    response = await send(rotated.access)
  }

  return { kind: "ok", response, rotated }
}
