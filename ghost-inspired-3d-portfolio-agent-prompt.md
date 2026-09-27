# Ultra-Modern Cinematic 3D Portfolio — AI Coding Agent Master Prompt

## Role

You are a senior creative developer, 3D web engineer, interaction designer, technical artist, and frontend performance specialist.

Your task is to design and implement an **ultra-modern, cinematic, interactive 3D developer portfolio** inspired by the *visual atmosphere and presentation language* of premium samurai action games such as **Ghost of Yōtei / Ghost of Tsushima**, while creating an **original portfolio experience** and **not copying protected game assets, characters, UI, logos, maps, music, or exact scenes**.

The portfolio must feel like a playable digital world rather than a normal scrolling website.

---

# 1. Primary Goal

Build a browser-based portfolio where the visitor controls or follows an original stylized wandering warrior character through a cinematic Japanese-inspired environment.

The site should combine:

- cinematic 3D scenes
- scroll-driven storytelling
- character movement
- subtle combat animations
- environmental exploration
- interactive project locations
- skills visualization
- experience timeline
- about section
- contact area
- smooth transitions between scenes
- premium game-like UI
- excellent desktop performance
- graceful mobile fallback

Do **not** fill the portfolio with final personal content yet.

Use realistic placeholder content and create the entire system so the real content can be inserted later from a single data/config file.

---

# 2. Creative Direction

## Overall Mood

The visual direction should feel:

- cinematic
- minimal
- atmospheric
- mysterious
- elegant
- premium
- Japanese-inspired
- dark but readable
- nature-driven
- emotionally immersive

Avoid looking like:

- a normal SaaS landing page
- a generic Three.js demo
- a gaming HUD clone
- a template portfolio
- a cyberpunk site
- an over-saturated neon website

The experience should feel closer to an interactive cinematic journey.

---

# 3. Reference Visual Language

Use the attached reference images only as **mood / composition / atmosphere references**.

Extract concepts such as:

- lone warrior silhouette
- traditional straw hat
- layered cloth and armor
- long cloak movement
- sword / katana silhouette
- wind-driven foliage
- falling leaves
- mountain horizons
- fog
- soft sunlight
- autumn forest
- black + warm ochre palette
- subtle Japanese calligraphy-inspired decorative typography
- cinematic framing
- large negative space
- character-centered composition

Do not recreate any exact character, armor set, logo, menu, pose, UI layout, or copyrighted game environment.

Create an original warrior identity.

---

# 4. Experience Concept

The website should behave like an explorable journey.

The visitor enters an atmospheric world.

The main character is placed in the environment.

Scrolling should not merely move the webpage vertically.

Instead, scrolling should advance a **cinematic timeline**.

Example experience:

1. Hero cinematic entrance
2. Character begins walking
3. Camera follows
4. Environment transitions
5. Character reaches a landmark
6. Project UI appears
7. Scroll continues
8. Character performs a short movement or combat animation
9. Camera sweeps into a new environment
10. Skills are revealed through environmental objects
11. Experience timeline appears
12. Final mountain / shrine scene
13. Contact CTA appears

Scrolling therefore becomes a **story controller**.

---

# 5. Technical Stack

Preferred stack:

- Next.js
- React
- TypeScript
- React Three Fiber
- Three.js
- Drei
- GSAP
- GSAP ScrollTrigger
- Framer Motion
- Lenis smooth scrolling
- Zustand for state
- Tailwind CSS
- React-use-measure where helpful
- GLTF / GLB assets
- Draco compression
- Meshopt compression
- KTX2 / Basis texture compression

Optional where useful:

- Theatre.js for cinematic sequencing
- postprocessing library
- WebGPU experimental enhancement with WebGL fallback

Do not introduce unnecessary libraries.

Architecture must remain clean and maintainable.

---

# 6. Scene Architecture

Create the portfolio as multiple connected cinematic chapters.

Suggested structure:

```text
World
 ├── Hero / Awakening
 ├── Path of Work
 ├── Project Shrine
 ├── Skills Forest
 ├── Experience Battlefield
 ├── About Sanctuary
 └── Contact Summit
```

Each section should feel physically connected.

Avoid hard page reloads.

Transitions should feel like moving through the same world.

---

# 7. Hero Scene

The first screen must immediately communicate premium quality.

Create:

- fullscreen WebGL scene
- cinematic camera
- wandering warrior
- wind animation
- cloth movement
- distant mountain
- drifting mist
- falling leaves
- subtle particles
- depth of field
- ambient environmental motion

Minimal overlay UI:

```text
[Developer Name]

Creative Software Engineer
Building systems, interfaces and digital experiences.

SCROLL TO BEGIN
```

Do not overload the hero with buttons.

The character should subtly breathe or shift weight while idle.

Mouse movement may slightly influence camera parallax.

---

# 8. Character System

Create an original 3D warrior.

Recommended design:

- straw hat
- layered dark cloak
- cloth sash
- simple shoulder armor
- katana
- neutral dark clothing
- warm accent fabric
- realistic silhouette
- slightly stylized proportions

Animations should include:

```text
Idle
Walk
Run
Turn
Look Around
Sword Draw
Sword Sheathe
Light Attack
Heavy Attack
Dodge
Block
Kneel
Stand
```

Only short tasteful combat animations should appear.

Avoid constant fighting.

The combat motion exists primarily as cinematic transition language.

---

# 9. Scroll-Controlled Character Motion

Scrolling must directly affect character and camera progression.

Example mapping:

```text
Scroll 0–10%
Idle → turn → begin walking

10–25%
Walk along mountain path

25–35%
Camera orbit + project area reveal

35–45%
Sword draw animation

45–55%
Short combat sequence

55–70%
Enter skills forest

70–82%
Experience / career path sequence

82–92%
About sanctuary

92–100%
Mountain summit / contact
```

Use GSAP timelines tied to scroll progress.

Character movement should remain deterministic.

Do not make the user scroll hundreds of pixels for tiny movements.

---

# 10. Interactive Movement Mode

After the main guided cinematic journey, optionally unlock **Explore Mode**.

Desktop controls:

```text
WASD — movement
Mouse — camera
Shift — sprint
Space — dodge / contextual action
E — interact
Esc — exit explore mode
```

Alternatively implement click-to-move if it produces a smoother experience.

Do not force manual game controls during the primary portfolio presentation.

Primary mode = guided cinematic scroll.

Secondary mode = optional exploration.

---

# 11. Project Exploration

Projects should exist as world locations instead of generic cards.

Examples:

- abandoned shrine
- lantern station
- sword rack
- temple gate
- stone monument
- campfire
- mountain lookout

When the character reaches one:

- environment slows
- camera reframes
- landmark activates
- project title fades in
- project summary appears
- tech stack appears
- action buttons become available

Example overlay:

```text
PROJECT 01

DevResume

Event-driven software engineering resume pipeline.

[View Project]
[GitHub]
```

Use placeholder project data initially.

---

# 12. Project Detail Interaction

Clicking a project should not immediately navigate away.

Open a cinematic project panel.

Possible design:

- side drawer
- floating glass panel
- diegetic scroll
- paper-texture UI
- ink brush transition

Panel content:

```text
Project Name
Short Summary
Problem
Solution
Tech Stack
Architecture
Key Features
Screenshots
GitHub
Live Demo
```

Allow closing the panel and continuing the journey.

---

# 13. Skills Section

Do not use boring progress bars.

Represent skills through environmental metaphors.

Possible examples:

```text
Frontend → illuminated shrine
Backend → forge
Cloud → mountain peak
DevOps → torii gate network
Databases → stone archive
AI → mystical lantern
```

As the user scrolls:

- camera glides past each landmark
- associated skills appear
- icons float subtly
- particles react
- short descriptions fade in

Example:

```text
DEVOPS

Docker
GitHub Actions
CI/CD
Linux
Cloud Infrastructure
Automation
```

Keep content data-driven.

---

# 14. Experience Timeline

Create an immersive timeline path.

Possible implementation:

The character walks along a narrow mountain path.

Each career milestone appears as:

- carved stone
- banner
- gate
- flag
- lantern

When passing a milestone:

```text
2025 — Present

Software Engineering
Company / Team

Brief description...
```

The timeline must remain readable even if WebGL is disabled.

---

# 15. About Section

Create a calmer visual scene.

Examples:

- warrior sitting beside a fire
- shrine interior
- lake at sunset
- mountain overlook

Text appears gradually.

Placeholder structure:

```text
ABOUT

I build software with a focus on
performance, automation, developer experience
and thoughtful interface design.
```

Add optional personal values / interests later.

---

# 16. Contact Scene

Finish at an elevated location.

Possible scene:

- mountain summit
- sunset
- wind
- distant birds
- warrior looking toward horizon

Contact UI:

```text
LET'S BUILD SOMETHING

Email
LinkedIn
GitHub

[Start a Conversation]
```

The experience should feel like completing a journey.

---

# 17. Cinematic Camera System

Create a dedicated camera director.

Requirements:

- scroll-controlled camera rails
- target tracking
- focal distance control
- gentle handheld movement
- cinematic easing
- controlled camera shake during combat
- smooth FOV changes
- no sudden jumps

Camera states should be authored separately.

Example:

```ts
type CameraShot = {
  position: Vector3Tuple
  target: Vector3Tuple
  fov: number
  duration: number
  easing: string
}
```

---

# 18. Environmental Effects

Use subtle effects.

Recommended:

- falling maple leaves
- drifting particles
- animated fog
- grass sway
- cloth physics approximation
- tree sway
- atmospheric lighting
- dust
- god rays
- wind zones

Do not overload the GPU.

Use instancing whenever possible.

---

# 19. Lighting

Target cinematic natural lighting.

Possible setups:

### Morning

- soft warm sunlight
- cool shadows
- volumetric fog

### Forest

- filtered directional light
- soft ambient fill
- dappled shadows

### Sunset

- warm key
- cool ambient sky
- long shadows

Avoid flat studio lighting.

---

# 20. Color Palette

Suggested palette:

```text
Ink Black       #0A0A0A
Charcoal        #161616
Warm Ivory      #E8E1D2
Ochre Gold      #C9912F
Autumn Red      #8F2F25
Forest Green    #24342A
Fog Grey        #A7A59E
```

Use colors sparingly.

---

# 21. Typography

Typography must complement the environment.

Use:

- modern editorial serif for headings
- clean sans-serif for UI text
- optional Japanese-inspired decorative accent font

Avoid cliché brush fonts for all text.

Typography should remain highly readable.

---

# 22. HUD / Navigation

Navigation should be extremely minimal.

Desktop example:

```text
01 Journey
02 Projects
03 Skills
04 Experience
05 About
06 Contact
```

Possible presentation:

- slim vertical navigation
- top-right chapter indicator
- subtle compass
- small progress line

Do not imitate the exact Ghost UI.

---

# 23. Cursor

Create a custom cursor.

States:

```text
Default
Hover
Interact
Drag
Explore
```

Possible visual:

- thin ring
- tiny central dot
- subtle magnetic movement

On interactive objects:

cursor expands and displays:

```text
VIEW
ENTER
EXPLORE
```

Keep cursor GPU-light.

---

# 24. Sound Design

Audio must be optional.

Possible ambient layer:

- wind
- distant birds
- leaves
- faint environmental ambience

No copyrighted soundtrack.

Provide toggle:

```text
Sound On / Off
```

Default can remain muted until user interaction.

---

# 25. Loading Experience

Do not display a generic spinner.

Create a cinematic preload screen.

Example:

```text
A thin circular ink stroke slowly completes.

Preparing the journey
73%
```

Preload only critical assets.

Lazy-load later chapters.

---

# 26. Performance Requirements

This is extremely important.

The site must run smoothly in a normal browser.

Target:

```text
Desktop:
60 FPS whenever possible

Mid-range laptops:
45–60 FPS

Mobile:
30–60 FPS with simplified rendering
```

Performance rules:

- GLB / GLTF compression
- Draco
- Meshopt
- KTX2 textures
- texture atlases
- LOD models
- instanced meshes
- lazy loading
- route-level code splitting
- avoid excessive transparent particles
- avoid unnecessary real-time shadows
- bake lighting when possible
- use low-resolution environment maps
- cap DPR
- suspend rendering when tab is hidden
- dispose textures/materials correctly
- render only visible chapters
- optimize animation mixers
- avoid React re-render loops
- never store frame-by-frame values in React state

Recommended DPR:

```ts
dpr={[1, 1.5]}
```

---

# 27. Adaptive Quality System

Automatically detect performance.

Create quality tiers:

```text
ULTRA
HIGH
MEDIUM
LOW
```

Adjust:

- shadow resolution
- particles
- post-processing
- vegetation density
- texture resolution
- DPR
- fog detail
- reflections

Use runtime FPS sampling.

If performance drops for several seconds, degrade quality automatically.

---

# 28. Mobile Strategy

Do not force the desktop scene onto low-end phones.

Mobile experience should retain the same artistic direction using:

- simplified 3D scene
- reduced particles
- static / low-poly environments
- shorter camera movements
- fewer lights
- no expensive DOF
- minimal shadows

If required, switch to cinematic image/video sections while preserving scroll storytelling.

Still keep projects and skills fully accessible.

---

# 29. Accessibility

Support:

- keyboard navigation
- reduced motion
- high contrast
- semantic HTML
- visible focus states
- aria labels
- text alternatives
- no content hidden exclusively inside WebGL

If:

```css
prefers-reduced-motion: reduce
```

then disable aggressive camera movement and combat animations.

---

# 30. SEO

Even though the experience is 3D, maintain strong SEO.

Include semantic content outside canvas.

Add:

```text
title
description
OpenGraph
Twitter cards
structured data
canonical URL
sitemap
robots.txt
```

Project information should exist in crawlable HTML.

---

# 31. Content Architecture

All portfolio content must come from one clean configuration.

Example:

```ts
export const portfolio = {
  profile: {
    name: "Your Name",
    role: "Software Engineer",
    intro: "...",
  },

  projects: [],

  skills: [],

  experience: [],

  socials: {},

  contact: {}
}
```

Do not hardcode content inside 3D components.

---

# 32. Suggested Folder Structure

```text
src/
 ├── app/
 ├── components/
 │   ├── canvas/
 │   ├── character/
 │   ├── environment/
 │   ├── effects/
 │   ├── ui/
 │   └── sections/
 │
 ├── scenes/
 │   ├── HeroScene.tsx
 │   ├── ProjectsScene.tsx
 │   ├── SkillsScene.tsx
 │   ├── ExperienceScene.tsx
 │   ├── AboutScene.tsx
 │   └── ContactScene.tsx
 │
 ├── animation/
 │   ├── cameraDirector.ts
 │   ├── scrollTimeline.ts
 │   └── characterAnimations.ts
 │
 ├── stores/
 │   └── experienceStore.ts
 │
 ├── config/
 │   └── portfolio.ts
 │
 ├── hooks/
 ├── lib/
 └── styles/
```

---

# 33. State Machine

Use a simple experience state machine.

Example states:

```text
LOADING
INTRO
WALKING
PROJECT_VIEW
COMBAT_TRANSITION
SKILLS
EXPERIENCE
ABOUT
CONTACT
EXPLORE
```

Transitions must remain predictable.

---

# 34. Animation Principles

Animations should feel:

- weighted
- elegant
- slow enough to understand
- responsive
- cinematic

Avoid:

- constant bouncing
- excessive spring animation
- random rotation
- unnecessary hover gimmicks
- aggressive parallax
- motion for motion's sake

Use motion to guide attention.

---

# 35. Scroll Feel

Implement Lenis + GSAP ScrollTrigger carefully.

Requirements:

- smooth but responsive
- no huge scroll lag
- no rubbery feel
- synchronize camera and character
- preserve normal browser accessibility
- restore scroll position correctly
- allow deep links to sections

---

# 36. Interaction Highlights

Add subtle premium interactions:

### Wind Reaction

Cursor movement slightly influences nearby leaves.

### Sword Reflection

Sword material catches directional light when camera changes.

### Grass Interaction

Grass bends slightly near character path.

### Lanterns

Hovering activates lantern glow.

### Project Shrine

Approaching triggers subtle environment reaction.

### Camera Focus

Clicking a project shifts focus smoothly.

---

# 37. Combat Transition Example

A short cinematic combat sequence can connect sections.

Example:

```text
Character stops.

Wind increases.

Leaves cross camera.

Character draws katana.

Two abstract shadow opponents enter.

Three fast choreographed moves occur.

Camera performs a controlled orbit.

Final slash.

Screen transitions through drifting leaves.

Next portfolio chapter appears.
```

Keep this sequence brief.

No gore.

No excessive violence.

It should function as motion design.

---

# 38. Loading Budget

Suggested initial payload target:

```text
Critical JS:
as small as reasonably possible

Initial 3D:
< 8–12 MB preferred

Textures:
mostly <= 2K

Secondary environments:
lazy-loaded
```

Do not load the entire world immediately.

---

# 39. Post Processing

Use minimally.

Possible effects:

- subtle bloom
- vignette
- color grading
- ambient occlusion
- depth of field

Avoid stacking many expensive effects.

Each effect must have a measurable visual reason.

---

# 40. Development Debug Panel

During development, add a hidden debug UI.

Controls:

```text
Camera position
Camera target
FOV
Fog density
Light intensity
Character animation
Scroll progress
Quality level
Particle count
FPS
```

Hide in production.

---

# 41. Fallback Strategy

If WebGL fails:

Render a polished 2D portfolio automatically.

Use:

- cinematic still backgrounds
- same typography
- same content
- normal scrolling
- same project panels

The portfolio must never become unusable because of 3D.

---

# 42. Placeholder Content

Until final content is provided, use placeholders.

Example:

```text
Name:
YOUR NAME

Role:
SOFTWARE ENGINEER

Intro:
I design and build performant software,
developer tools and digital experiences.
```

Projects:

```text
Project 01
Project 02
Project 03
Project 04
```

Skills:

```text
Frontend
Backend
DevOps
Cloud
Databases
AI
```

Do not invent personal employment history.

---

# 43. Deliverables

Build:

1. Complete frontend
2. Responsive layout
3. 3D scene architecture
4. Scroll-driven camera
5. Character animation controller
6. Placeholder warrior model integration layer
7. Project landmark system
8. Skills environment
9. Experience timeline
10. About scene
11. Contact scene
12. Loading screen
13. Audio controls
14. Quality settings
15. Mobile fallback
16. Reduced-motion mode
17. SEO structure
18. Performance instrumentation

---

# 44. Asset Handling

Do not embed proprietary game assets.

Use:

- original models
- permissively licensed assets
- custom low-poly placeholders
- procedurally created scenery

Provide an `/assets/README.md` describing expected files.

Example:

```text
/models/warrior.glb
/models/torii.glb
/models/shrine.glb
/models/rocks.glb
/models/trees.glb

/textures/
/audio/
```

If final assets are unavailable, use clearly labeled placeholder geometry.

The application must still run.

---

# 45. Implementation Order

Build in this exact order.

## Phase 1 — Foundation

- Next.js
- TypeScript
- Tailwind
- application shell
- portfolio config
- accessibility structure

## Phase 2 — 3D Core

- Canvas
- camera controller
- lighting
- base environment
- character controller

## Phase 3 — Scroll Engine

- Lenis
- GSAP
- scroll progress
- camera rails
- chapter transitions

## Phase 4 — Portfolio Sections

- projects
- skills
- experience
- about
- contact

## Phase 5 — Cinematic Polish

- particles
- foliage
- fog
- cloth
- combat transition
- post processing

## Phase 6 — Performance

- compression
- LOD
- adaptive quality
- mobile
- profiling

## Phase 7 — QA

- Chrome
- Edge
- Firefox
- Safari
- mobile
- reduced motion

---

# 46. Performance Validation

Before considering the project complete:

Measure:

```text
FPS
GPU frame time
CPU frame time
JS bundle size
Texture memory
GLB size
Largest Contentful Paint
Interaction to Next Paint
Cumulative Layout Shift
```

Run Lighthouse.

Do not sacrifice usability for visual effects.

---

# 47. Important Design Constraint

The project must feel impressive **without requiring a gaming PC**.

A high-end experience is not created by maximizing polygons.

Achieve quality through:

- composition
- camera direction
- lighting
- animation
- atmosphere
- typography
- sound
- timing
- transitions

---

# 48. Desired Emotional Journey

The visitor should feel:

```text
Curiosity
↓
Discovery
↓
Power
↓
Calm
↓
Confidence
↓
Connection
```

The portfolio should leave a memorable impression without distracting from the developer's actual work.

---

# 49. Do Not Do

Avoid:

- copying Ghost of Yōtei assets
- copying Ghost of Tsushima UI
- copying characters
- copyrighted soundtrack
- excessive shaders
- giant bundle sizes
- mandatory WASD navigation
- confusing navigation
- unreadable cinematic text
- 10-second intro before content
- excessive scroll hijacking
- giant uncompressed textures
- rendering all scenes simultaneously
- full physics simulation unless necessary
- autoplay audio
- unnecessary loading screens

---

# 50. Quality Bar

Think of the final result as a combination of:

```text
AAA game cinematic presentation
+
award-winning portfolio storytelling
+
editorial web typography
+
high-performance WebGL engineering
+
clean software architecture
```

The project must still feel like a professional software engineer's portfolio.

---

# 51. First Implementation Milestone

Start by building a working prototype containing only:

- cinematic hero scene
- placeholder warrior
- mountain / forest environment
- falling leaves
- scroll-controlled character walk
- scroll-controlled cinematic camera
- one project landmark
- one project detail panel
- adaptive performance quality
- responsive fallback

Do not build every section before validating this prototype.

Once the prototype is stable and smooth, expand the world.

---

# 52. Agent Working Rules

When implementing:

1. Inspect the existing repository first.
2. Reuse the current stack when sensible.
3. Do not rewrite working architecture without a reason.
4. Keep components modular.
5. Keep 3D rendering logic separate from normal UI.
6. Keep portfolio data separate from components.
7. Document major architectural decisions.
8. Avoid fake implementations.
9. Do not leave broken placeholders.
10. Make the app runnable after every major phase.
11. Fix TypeScript errors.
12. Fix console warnings.
13. Validate responsive behavior.
14. Profile before adding more visual effects.

---

# 53. Expected Agent Response

Before coding, provide:

```text
1. Repository analysis
2. Proposed architecture
3. Libraries required
4. Scene graph
5. Scroll timeline
6. Performance strategy
7. Implementation phases
```

Then start implementation.

Do not spend the entire response explaining.

Produce working code.

---

# 54. Final Creative Instruction

Create a portfolio that feels like entering a living story.

The warrior should not simply stand behind text.

The **character, camera, environment, projects and user scroll must behave as one coordinated system**.

Every animation should help reveal something about the portfolio.

The result should feel cinematic enough to be memorable, yet fast enough to use every day in a normal browser.
