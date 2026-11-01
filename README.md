# CareerLift web

Next.js frontend for CareerLift: upload resumes, get ATS scores, match them against job
descriptions and generate cover letters, LinkedIn profiles and resume rewrites with AI.

The API lives in the separate [`resume_ai_platform`](https://github.com/moarij16/resume_ai_platform)
repo (Django REST).

## Quick start

```bash
npm install                      # also installs git hooks
cp .env.example .env.local       # DJANGO_API_URL=http://localhost:8000/api/v1
npm run dev                      # http://localhost:3000 (start the Django API first)
```

| Script              | Purpose                                     |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Dev server                                  |
| `npm run build`     | Production build                            |
| `npm run typecheck` | Generate route types and run `tsc`          |
| `npm run lint`      | ESLint                                      |
| `npm run format`    | Prettier                                    |
| `npm test`          | Unit and component tests (Vitest)           |
| `npm run test:e2e`  | Playwright smoke test against a running API |

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui ·
TanStack Query, Form and Table · Zod · Vitest, MSW and Playwright

## Deploy (Vercel)

Import this repo as a Vercel project (Next.js is detected) and set one environment variable:
`DJANGO_API_URL=https://<your-api>.vercel.app/api/v1`. The API deploys as its own Vercel project;
the full walkthrough is in the API repo's `docs/deploy.md`.

## Docs

| Doc                                          | What's in it                                       |
| -------------------------------------------- | -------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md) | BFF auth flow, layers, SOLID mapping, state        |
| [CONTRIBUTING.md](CONTRIBUTING.md)           | Branches, commits, PRs, code standards             |
| [AGENTS.md](AGENTS.md)                       | Rules for AI coding agents (loaded by `CLAUDE.md`) |
| [docs/adr/](docs/adr/README.md)              | Architecture decision records                      |
