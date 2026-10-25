# Architecture

CareerLift web is the user-facing app for the CareerLift API (`resume_ai_platform`, Django REST).
Users upload resumes, see ATS scores, match resumes against saved jobs and generate cover letters,
LinkedIn profiles and resume rewrites with AI.

## Request flow (Backend-for-Frontend)

```
Browser ── same-origin fetch ──► Next.js
                                   ├─ /api/auth/{login,register,logout}   sets/clears httpOnly cookies
                                   └─ /api/proxy/<path>                   adds Bearer token, refreshes on 401
                                              │
                                              ▼
                                   Django  {DJANGO_API_URL}/<path>/
```

- `cl_access` and `cl_refresh` are httpOnly, `SameSite=Lax` cookies (`Secure` in production).
  Each cookie's `maxAge` follows its JWT `exp`.
- `src/server/forward.ts` (pure and unit-tested) forwards the request. If the access cookie is
  missing or Django returns 401, it refreshes once and retries.
- Django rotates refresh tokens and blacklists the old one. `src/server/token-refresher.ts`
  de-duplicates concurrent refreshes, so parallel requests can't log the user out.
- The proxy appends Django's trailing slash and blocks `users/auth/*`, so tokens can only flow
  through `/api/auth/*`. Multipart uploads and file downloads stream through unchanged.
- `src/proxy.ts` (Next 16's replacement for middleware) redirects requests without a session
  cookie to `/login?next=…`, and sends signed-in users away from the auth pages. This check is
  optimistic: Django stays the authority.
- When the BFF returns 401, the browser client clears the Query cache and routes to `/login`.

## Layers

| Layer       | Where                         | Responsibility                                          |
| ----------- | ----------------------------- | ------------------------------------------------------- |
| Routes      | `src/app/**/page.tsx`         | Metadata plus a feature component; `params` in Suspense |
| Components  | `src/features/*/components`   | Rendering and local UI state                            |
| Hooks       | `src/features/*/hooks.ts`     | TanStack Query queries and mutations, cache updates     |
| Services    | `src/features/*/api.ts`       | Endpoint mapping over `HttpClient`                      |
| Transport   | `src/lib/http/*`              | `HttpClient` interface, fetch impl, error normaliser    |
| Composition | `src/lib/api.ts`, `providers` | Builds services once and provides them via `useApi()`   |
| Server      | `src/server/*`, `src/app/api` | Env, session cookies, refresh, forwarding               |

### SOLID in practice

- **Single responsibility:** each layer has one job (see the table above).
- **Open/closed:** document types (`features/documents/registry.ts`) and ATS scan modes
  (`features/ats/scan-views.tsx`) are registries. Adding one means adding an entry, not editing
  pages.
- **Liskov substitution:** every document renderer takes `DocumentRendererProps`, and any
  `HttpClient` implementation (fetch, or a test fake) can be swapped in.
- **Interface segregation:** services expose small interfaces, e.g. `ResumeReader`,
  `ResumeWriter` and `ResumeUploader`.
- **Dependency inversion:** features depend on `HttpClient` and `Api`, not on `fetch`. Tests
  inject fakes through `ApiProvider`.

## State

- **Server state:** TanStack Query only. Keys come from `src/lib/query-keys.ts`. Mutations write
  results straight into the cache, and deletes remove rows from it, because the backend's soft
  delete still lists them.
- **Form state:** TanStack Form via `useAppForm`. Zod validates on change, and `onSubmitAsync`
  calls the mutation and maps server field errors back onto fields.
- **UI state:** local component state. There is no global client store.

## Rendering

Cache Components is on, so pages prerender as static shells. Data loads on the client through
the BFF. Anything that reads request data (`params`, `useSearchParams`, `usePathname`) sits inside
`<Suspense>`, which makes detail routes partially prerendered.

## Error handling

`toApiError` collapses the backend's error shapes into
`ApiError { status, message, fieldErrors }`:

- forms show field and form-level errors inline;
- other mutations toast through the global `MutationCache`;
- queries render `ErrorState` with a retry button.

AI 5xx responses are replaced with a friendly message.

## Decisions

See [docs/adr/](adr/README.md).
