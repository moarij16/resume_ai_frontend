# Contributing to CareerLift web

## Setup

1. Node 24 (`.nvmrc`) and npm.
2. `npm install`. This also installs the git hooks via husky.
3. `cp .env.example .env.local` and point `DJANGO_API_URL` at the API (default
   `http://localhost:8000/api/v1`).
4. Start the Django API from the `resume_ai_platform` repo, then run `npm run dev`.

## Branches

| Branch      | Purpose                                                 |
| ----------- | ------------------------------------------------------- |
| `main`      | Production. Only updated by release PRs from `develop`. |
| `develop`   | Integration branch and the default PR target.           |
| `feature/*` | New functionality, e.g. `feature/resume-editor`         |
| `fix/*`     | Bug fixes                                               |
| `chore/*`   | Tooling, dependencies, configuration                    |
| `docs/*`    | Documentation only                                      |

Branch from `develop` and open a PR back into `develop`. Never force-push to `main` or `develop`,
and never rewrite pushed history. Address review comments with new commits on the same branch.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint on
`commit-msg`:

```
<type>(<optional scope>): <imperative summary>

feat(ats): show keyword density table for job matches
fix(bff): persist rotated refresh token after retry
docs(adr): record client-side table processing
```

- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
  `revert`
- **Scopes** (optional): `auth`, `bff`, `resumes`, `jobs`, `ats`, `documents`, `dashboard`,
  `profile`, `ui`, `layout`, `api`, `deps`, `ci`, `docs`, `adr`, `release`. To add a new one, edit
  `commitlint.config.mjs`.
- One concern per commit. No "wip" or "fix stuff" commits.
- Never commit secrets, `.env*` files (except `.env.example`), generated files or build output.

The `pre-commit` hook runs ESLint (`--fix`, zero warnings) and Prettier on staged files.

## Pull requests

Use the [PR template](.github/pull_request_template.md). Every PR description includes:

1. **Summary:** what and why
2. **What changed:** the notable changes and decisions
3. **Screenshots / GIF notes** for anything visual
4. **How to test:** a step-by-step manual checklist
5. **Known limitations**

CI (format, lint, typecheck, unit tests, build) must pass. Passing CI doesn't replace manual
testing against a running API.

## Releases

At the end of each milestone, a release PR from `develop` into `main` carries a changelog. After it
merges, tag the release (`v0.1.0`, …).

## Code standards

- Follow the layering in [AGENTS.md](AGENTS.md#architecture-rules): services over `HttpClient`,
  Query hooks, rendering components and thin pages.
- TypeScript strict. No `any` without a comment explaining why.
- Validate with Zod at boundaries: env vars, form input and untrusted JSON such as
  `document_content`.
- Keep server and client code separate. Server-only modules import `server-only`, and JWTs never
  reach client code.
- Make UI accessible: keyboard support, labels, visible focus states and sufficient contrast.
  Prefer the shadcn/Radix primitives.
- Keep user-facing errors friendly. Never surface raw backend or AI-provider messages.
- Add tests next to the code (`*.test.ts(x)`). Use MSW for HTTP, and inject a fake `Api` through
  `ApiProvider` for components.
- Record significant decisions as an [ADR](docs/adr/). Copy `docs/adr/template.md` to start one.
