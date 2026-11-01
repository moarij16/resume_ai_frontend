<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CareerLift web: agent guide

The Next.js 16 frontend for CareerLift. It talks to the Django REST API in the separate
`resume_ai_platform` repo, always through this app's own server-side proxy (BFF).

Read [CONTRIBUTING.md](CONTRIBUTING.md) for branches, commits and PRs, and
[docs/architecture.md](docs/architecture.md) for the full picture.

## Commands

| Task             | Command                                                    |
| ---------------- | ---------------------------------------------------------- |
| Dev server       | `npm run dev` (http://localhost:3000, Django on :8000)     |
| Typecheck        | `npm run typecheck` (runs `next typegen` first)            |
| Lint             | `npm run lint`                                             |
| Format           | `npm run format` / `npm run format:check`                  |
| Unit tests       | `npm test` (Vitest + Testing Library + MSW)                |
| E2E smoke        | `E2E_EMAIL=… E2E_PASSWORD=… npm run test:e2e` (Playwright) |
| Production build | `npm run build`                                            |

Before calling a change done, run typecheck, lint, test and build.

## Stack

Next.js 16 App Router (Cache Components on, `proxy.ts` instead of middleware), React 19,
TypeScript strict, Tailwind CSS v4, shadcn/ui (Radix), TanStack Query v5, TanStack Form v1,
TanStack Table **v9**, Zod v4, lucide-react 1.x.

Several of these have breaking changes from what you may know:

- **TanStack Table v9:** use `useTable` with explicit `tableFeatures({...})`. `useReactTable` and
  `getCoreRowModel` are gone. Read `node_modules/@tanstack/react-table/skills/`.
- **Cache Components:** reading `params`, `searchParams`, `cookies()`, `usePathname()` or
  `useSearchParams()` must happen inside `<Suspense>`. Detail pages await `params` in a child
  component; see `src/app/(app)/resumes/[id]/page.tsx`.
- **lucide-react 1.x** has no brand icons (no `LinkedinIcon`).
- **shadcn** components import `cn` from the `cn` package.

## Architecture rules

```
src/
  app/            routes only: thin pages, layouts, route handlers
    (auth)/       login, register
    (app)/        authenticated shell + feature pages
    api/auth/*    BFF: login/register/logout, which set httpOnly JWT cookies
    api/proxy/*   BFF: forwards to Django with the Bearer token and refreshes on 401
  server/         server-only code (import "server-only"): env, session, refresh, forwarding
  features/<f>/   api.ts (service) · hooks.ts (Query) · schemas.ts (Zod) · components/
  components/     ui/ (shadcn, generated) · shared/ · form/ · layout/
  lib/            http client, query client and keys, composition root, formatters
  types/api.ts    DTOs mirroring the Django serializers
```

- **Tokens never reach the browser.** Only `src/server/*` and `src/app/api/*` touch JWTs. Never
  add a client-side `Authorization` header or call Django directly from the browser.
- **Depend on abstractions.** Feature services are factories over the `HttpClient` interface
  (`src/lib/http/client.ts`) and are wired once in `src/lib/api.ts`. Components get them through
  `useApi()`. Don't call `fetch` in components or hooks.
- **One job per layer:** `api.ts` maps endpoints, `hooks.ts` wraps them in TanStack Query
  (keys from `src/lib/query-keys.ts`), and components render.
- **Extend through registries, don't switch on types.** Document types live in
  `features/documents/registry.ts` and ATS scan modes in `features/ats/scan-views.tsx`. A new
  type or mode is a new entry there.
- **Forms** use `useAppForm` (`src/components/form/form.tsx`) with a Zod schema on `onChange`, and
  call the mutation in `onSubmitAsync`, mapping server errors with `toFormErrors`. Form mutations
  set `meta: { silent: true }` so the global toast doesn't duplicate inline errors.
- **Server state lives only in TanStack Query.** No global client store. Update or invalidate
  caches in mutation `onSuccess`.
- Pages under `src/app` stay thin: metadata plus a feature component.

## Backend contract

- `src/types/api.ts` mirrors the Django serializers. When the backend changes a shape, update it
  there first, then fix the type errors.
- Error bodies come in several shapes. Always go through `toApiError` / `getErrorMessage`
  (`src/lib/http/errors.ts`).
- `document_content` may be JSON or raw text. Parse it with `features/documents/content.ts`,
  which never throws.
- Lists are unpaginated arrays. The `DataTable` sorts, searches and paginates on the client.
- When PATCHing `resume_data`, preserve `raw_text`. Every scan and generator on the backend
  depends on it.
- The API only returns the signed-in user's own, non-deleted records; other users' IDs come back
  as 404 (detail routes) or "X not found." field errors (request bodies).
- AI failures are 503s whose `detail` is a fixed, user-facing message (unavailable / busy /
  failed). Show it as-is.
- Known backend quirk the UI works around: `breakdown.resume_length` is always null, so the UI
  reads `scan_result.resume_length_score`.

## Don'ts

- Don't edit `src/components/ui/*` by hand for feature needs. Compose in `components/shared`.
- No `any` without a comment explaining why. Validate external data with Zod.
- Don't commit `.env*` (only `.env.example`), `.next/` or test reports.
- Don't show raw backend or AI-provider error text to users.
