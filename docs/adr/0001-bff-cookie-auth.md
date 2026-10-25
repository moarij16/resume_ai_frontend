# 0001. Keep JWTs in httpOnly cookies behind a Next.js BFF

- **Status:** Accepted
- **Date:** 2026-10-25

## Context

The Django API issues a short-lived access token (15 minutes) and a rotating refresh token
(7 days) that is blacklisted after use. If the browser stored those tokens itself, any XSS could
read them, and every tab would have to coordinate refreshes.

## Decision

- Route handlers under `/api/auth/*` exchange credentials with Django and store both tokens in
  httpOnly, `SameSite=Lax` cookies (`Secure` in production). The browser only ever receives the
  user object.
- All data requests go to `/api/proxy/<path>`, which adds `Authorization: Bearer`. When the token
  is missing or rejected, it refreshes once (de-duplicated per refresh token), retries, and
  persists the rotated pair.
- `src/proxy.ts` redirects page requests without a session to `/login`, with a sanitised `next`
  parameter.
- `users/auth/*` can't be reached through the generic proxy.

## Alternatives considered

- **Tokens in memory or `localStorage`, calling Django directly:** simpler, but exposes tokens to
  XSS and needs CORS plus cross-tab refresh coordination.
- **A full auth library (Auth.js):** adds a session layer on top of a backend that already issues
  JWTs.

## Consequences

The Next server is now on the request path, which adds a hop per call and requires Node hosting.
CORS on Django isn't needed for the web app. The refresh de-duplication cache is per-process; if
the app is scaled horizontally, move it to a shared store or accept rare forced re-logins.
