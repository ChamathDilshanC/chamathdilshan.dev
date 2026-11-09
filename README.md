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
├── (public)/          public pages: home, projects, about, blog, contact (static)
│   └── layout.tsx     smooth scroll, FAQ and footer shared by every page
├── ChamathDilshanC/   admin UI — force-dynamic, no-store, noindex
├── api/revalidate/    on-demand cache invalidation endpoint (secret-protected)
├── layout.tsx         root layout, fonts (Geist + Inter), metadata
├── globals.css        design tokens, type scale, keyframes
├── sitemap.ts
└── robots.ts

content/       default content: build fallback + database seed
components/
├── layout/    header, mobile menu, heroes, FAQ, footer, wordmark
├── sections/  home page sections and shared page sections
├── motion/    smooth scroll, reveals, parallax, ticker, text effects
├── cards/     project and article cards
└── ui/        arrow link, section title, image, lists
lib/           api client, cache tags, easing curves, helpers
hooks/         client-side hooks
```

## UI components and pagination

TypeScript and Tailwind CSS v4 are already installed. Reusable UI components live
in `components/ui`, styles and site tokens in `app/globals.css`, and imports use
the `@/` alias. `components.json` configures these paths for the shadcn CLI, with
the existing `cn` helper in `lib/utils.ts`. Add future shadcn components with:

```bash
npx shadcn@latest add button
```

The Projects and Journal listings show six items per page. Pagination appears
only for more than six items and stores its current page in `?page=2` so refresh,
shared links and browser history keep the selection. Existing homepage grids
and related articles keep their original layout. Invalid page values fall back
to page one; out-of-range values show the last available page.

`components/ui/reshaped-pagination.tsx` re-exports the real `reshaped/bundle`
component and precompiled CSS. `components/ui/demo.tsx` contains the supplied
standalone example. The listing uses a scoped slate provider and the site's
Geist font, with local overrides in
`components/sections/paginated-card-grid.module.css`.

## About Toolbox

The dark Toolbox section uses Shadcn Space's `marquee-02`, installed with:

```bash
pnpm dlx shadcn@latest add @shadcn-space/marquee-02
```

Manage this independent list under **Sections → About · Toolbox**. Each tool
has a name, role and optional **Logo** using the same theSVG search as Skills.
Add, remove or reorder items there; removing every item hides the section.
The marquee supports pause/resume, pauses on hover and respects reduced motion.

Old placeholder photo tiles become brand logos when read; saved custom logo
URLs are preserved. Deploy the frontend and backend updates together. No
database migration is required.

---

## Design and content

The public site follows an editorial agency layout: Geist type, a black and
white palette with an orange glow, and slow inertial scrolling.

- **Copy, images, projects, articles, work experience and skills** are edited in the admin
  panel at `/ChamathDilshanC` and read from the API (`lib/content.ts`).
  `content/*.ts` holds the defaults: the build-time fallback when the API is
  unreachable and the database seed (`npm run export:seed`). Setup:
  `docs/ADMIN_CMS.md` in the main repo.
- **Images** uploaded in the admin live on Cloudinary. The default content uses
  placeholders in `public/images/placeholders/`; `npm test` fails if a default
  points at a missing file.
- **Breakpoints** are `m:` (810px, tablet) and `l:` (1200px, desktop).
- **Type** uses the `type-heading-*` and `type-body-*` classes in
  `app/globals.css`, matching the design's scale.
- **Motion** uses Lenis for scrolling (`components/motion/smooth-scroll.tsx`,
  intensity 20 = 2 s ease per wheel step) and Motion for scroll-linked
  effects. Everything respects `prefers-reduced-motion`.
- **Contact form** opens the visitor's mail app until a backend endpoint
  exists; see `components/sections/contact-form.tsx`.

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
