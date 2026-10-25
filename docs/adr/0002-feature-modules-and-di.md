# 0002. Organise by feature with injected services

- **Status:** Accepted
- **Date:** 2026-10-25

## Context

The app covers several backend resources (resumes, jobs, ATS scans, documents, profile) that
share UI patterns: lists, detail pages, forms and long-running mutations. We want SOLID
boundaries, easy testing and room to add document types and scan modes.

## Decision

- Code lives in `src/features/<feature>/` with `api.ts` (a service factory over `HttpClient`),
  `hooks.ts` (TanStack Query), `schemas.ts` (Zod) and `components/`.
- `src/lib/api.ts` is the single composition root. `ApiProvider` and `useApi()` provide the
  services to the tree.
- Variants are registries: `DOCUMENT_TYPES` and `getScanView()`.
- Server state is TanStack Query only. Forms use TanStack Form with Zod. Lists use TanStack
  Table v9 with client-side sorting, filtering and pagination, because the API returns
  unpaginated arrays.

## Alternatives considered

- **Layer-first folders (`hooks/`, `services/`, `components/`):** spreads a feature across the tree.
- **Server Components fetching with cookies:** RSCs can't persist rotated refresh tokens, which
  would break the refresh flow (see ADR 0001).
- **A global store (Redux, Zustand):** duplicates what Query already caches.

## Consequences

Features can be tested in isolation by injecting a fake `Api`. Client-side table processing
won't scale to very large lists. Switch to manual (server) pagination once the backend
paginates.
