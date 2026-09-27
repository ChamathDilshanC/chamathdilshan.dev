# Portfolio assets

The live world uses all five GLB files supplied in `3D Models/`. Sources are preserved. The browser only requests optimized copies under `public/assets/models/`.

| Web asset | Use |
| --- | --- |
| sorceress.glb | Opening guardian, skills and finale |
| necromancer.glb | Projects, experience and about |
| fighter.glb | Flight passage between projects and skills |
| mango.glb | Right-hand canopy |
| forest.glb | Layered background trees |

Run `npm run models:prepare` to regenerate web assets. The script removes unnecessary tangents, reuses exactly identical UV channels, simplifies geometry, resizes textures to at most 1024 px, encodes WebP, and compresses geometry with Draco. `manifest.json` records source filenames, sizes, bounds and animation counts. The five outputs total approximately 6.82 MB (98.3% smaller than the 406.54 MB sources).

`components/environment/ModelStage.tsx` normalizes model scale and ground position. Adjust its placements and yaw values to change the composition. The source characters contain no animation clips or rigs: floating, banking, turning, reveals and camera motion use whole-model transforms. The old articulated warrior remains as an unused component.

The necromancer and fighter load when reaching Projects. Each model has its own Suspense and error boundary. Models share cached geometry/materials across remounts; clones are not disposed on unmount because the loader owns their resources. Local Draco decoders are served from `/assets/decoders/draco/`, with their existing license files. No decoder CDN or external environment map is required.

Spell casting, phase dodges, cannon bursts and centered barrel rolls are procedural action sequences. Characters have no semantic limb meshes or skeletons, so no walking, hand or facial animation is claimed. Adding those requires rigging and skinning the character sources. The current geometry remains intact.

`public/assets/world-poster.webp` is a capture of the actual scene for still mode and WebGL failures. Run the dev server, then `node scripts/preview-world.mjs` to refresh that poster and ignored desktop/mobile QA screenshots in `artifacts/`.

Project screenshots remain optional `{ src, alt }` entries in `config/portfolio.ts`. Configure real project links and contact details there before enabling them. The audio toggle synthesizes wind locally and never autoplays.
