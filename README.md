# chamathdilshan.dev — Frontend

Next.js 16 (App Router) application serving the public portfolio and the
owner-only admin UI.

This repository is a **submodule** of
[ChamathDilshanC/chamathdilshan](https://github.com/ChamathDilshanC/chamathdilshan).
It deploys on its own, with the repo root as the app root.

---

## Run locally

```bash
npm install
cp .env.example .env.local     # fill in NEXT_PUBLIC_API_URL etc.
npm run dev                    # http://localhost:3000
```

The backend must be running (default `http://localhost:8000`).

---

## Structure

```text
app/
├── (public)/          public pages — static + ISR
├── ChamathDilshanC/   admin UI — force-dynamic, no-store, noindex
├── api/revalidate/    on-demand cache invalidation endpoint (secret-protected)
├── layout.tsx         root layout + metadata
├── sitemap.ts
└── robots.ts

components/    layout, ui, cards, admin, seo
features/      feature-scoped composition (projects, blog, research, profile)
lib/           api client, cache tags, generated API types
hooks/         client-side hooks (SWR wrappers for admin)
```

---

## Caching

All server reads go through `lib/api.ts` so revalidate windows and cache tags
stay consistent. Tag vocabulary lives in `lib/cache-tags.ts` and must match the
backend's Redis tags.

- Public pages: `force-static` + ISR, tagged fetches
- Admin pages: `force-dynamic` + `force-no-store`
- Backend calls `POST /api/revalidate` after every mutation

Full policy: `docs/CACHING.md` in the main repo.

---

## API types

Types are generated from the backend OpenAPI schema — never hand-written:

```bash
npm run gen:api        # writes lib/api-types.ts (gitignored)
```

---

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run gen:api` | Regenerate API types from OpenAPI |
| `npm test` | Vitest |

---

## Commit policy

Author and committer must be `ChamathDilshanC`. No AI attribution trailers.
See `GITPUSH.md` in the main repo.
