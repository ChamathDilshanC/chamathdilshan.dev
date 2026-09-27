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

The cinematic home page runs independently from `config/portfolio.ts`; no backend or environment variables are required to preview it. The existing API helpers and admin scaffold still use the backend (default `http://localhost:8000`).

## Cinematic portfolio

The public home page is a scroll-controlled fantasy / sci-fi world using all five supplied GLB models: the sorceress, necromancer, Decepticon fighter, mango tree, and realistic trees. Camera orbits, character reveals, floating movement, an illuminated portal, and particles respond to scrolling. Edit portfolio content in `config/portfolio.ts`; sample projects, career entries, and contact configuration still need the owner's real details.

- `animation/`: authored camera shots, deterministic character actions, GSAP/Lenis scroll mapping.
- `components/canvas/`: lazy WebGL world, camera direction, adaptive quality, frame instrumentation.
- `components/environment/ModelStage.tsx`: supplied models, scroll transitions, portal and scenery. Legacy procedural components remain available but are not mounted in the current world.
- `app/world-theme.css`: responsive midnight teal / gold visual design.
- `scripts/prepare-models.mjs`: repeatable mesh simplification, duplicate UV cleanup, Draco geometry and WebP texture optimization; source files are never overwritten.
- `components/ui/`, `components/sections/`: accessible HTML content, dialogs, settings, opt-in audio, skill tabs, summit exploration.
- `stores/experience-store.ts`: discrete Zustand state and separate mutable frame data.
- `assets/README.md`: model conventions, local decoders, licensing, and asset replacement instructions.

Mobile uses the 3D scene with a portrait camera and LOW quality. Settings can select a render tier, still mode, or reduced motion. WebGL errors/context loss switch to a lightweight poster captured from the actual scene. A failed individual model leaves the rest of the world and all portfolio controls usable. Reduced motion disables ambient movement and parallax, skips Lenis, and renders on demand; chapter navigation updates the camera immediately. Sound starts off and is synthesized locally after a user gesture. At the final chapter, desktop users can move the camera with WASD, move faster with Shift, inspect a project with E, and exit with Escape.

The five web models total about **6.82 MB**, compared with **406.54 MB** of source files. The initial sorceress and trees total about 5.34 MB; the necromancer and fighter are requested on reaching Projects. Rebuild them with `npm run models:prepare` when the files in `3D Models/` change. These source models contain no skeletal animation clips, so the experience animates whole-model transforms and the camera.

Characters now perform spell charge/release, levitation and phase-dodge actions. The gunship patrols with engine trails and can fire cannon bursts or do a barrel roll around its center; its existing engine and gun joints also animate. Click a model to cast/fire, or use the model's action buttons (also available on mobile). Auto actions can be toggled off; reduced motion disables them. Character actions use whole-model poses and effects, not rigged limb animations. The fighter uses a skeleton-aware clone with updated bone matrices before measuring bounds. Action timing lives in `animation/model-actions.ts`, with effects in `components/effects/ActionEffects.tsx`.

Development allows `localhost`, `127.0.0.1`, and this workstation's LAN address (`192.168.1.26`). If the LAN address changes, update the explicit `allowedDevOrigins` entry in `next.config.ts`. A captured scene poster is visible before JavaScript loads as well as in still mode.

The F2 development panel exposes live FPS, CPU render submission time, optional GPU timer results, draw calls, triangle counts, textures, geometry count, camera/target/FOV, progress, animation and quality. It is omitted in production. Web Vitals are recorded as Performance marks named `portfolio:LCP`, `portfolio:INP`, and `portfolio:CLS`; no analytics or data transmission is configured.

```bash
npm run typecheck
npm run lint
npm test
npx playwright install chromium firefox webkit
npm run dev                  # separate terminal
npm run test:browser          # Chromium, Edge, Firefox, WebKit, iPhone emulation
npm run build
npm run start -- --port 3001  # separate terminal
node scripts/audit.mjs        # desktop + mobile Lighthouse reports in artifacts/
```

Edge tests require a local Edge installation. WebKit/iPhone tests emulate that browser engine and viewport; they are not a substitute for testing on physical Apple hardware. Generated screenshots, traces, and audit reports are ignored by Git. Validation results and architectural decisions are documented in the umbrella repository's `docs/PORTFOLIO_IMPLEMENTATION.md`.

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
