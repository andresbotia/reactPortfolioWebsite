# Project

AndresBotia.com is a premium software-engineering portfolio for Andres Botia. It should feel technical, cinematic, polished, modern, interactive, and professional. The core concept is modern interfaces connected to complex real-world systems.

# Architecture

This is a React + Vite + TypeScript app. Content lives in `src/data/`. Page sections live in `src/sections/`. Shared layout and primitives live in `src/components/`. Three.js scenes live in `src/three/`.

# Commands

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

Before considering work complete, `npm run lint` and `npm run build` must pass.

# Design Philosophy

Keep the site premium, minimal, technical, aviation-influenced, interactive, and performance-conscious. Do not turn this website into a generic portfolio template.

# ThreeUI / Three.js

ThreeUI Community is an implementation reference for lifecycle, procedural visuals, interaction, and performance patterns. Do not turn this project into a ThreeUI demo gallery. The primary Three.js scenes are the hero route/system topology in `src/three/scenes/HeroScene.tsx` and scroll-reactive voxel field in `src/three/scenes/ScrollVoxelField.tsx`.

Only add new WebGL effects when they clearly improve the portfolio narrative. Prefer one exceptional scene over multiple competing canvases.

# Component Rules

- Keep reusable primitives in `src/components/ui/`.
- Keep section-specific UI inside the relevant `src/sections/` folder.
- Keep factual portfolio content centralized in `src/data/`.
- Avoid giant components.
- Avoid duplicated content.
- Avoid unnecessary dependencies.
- Do not fetch authenticated data directly from the client. GitHub contribution history requires a server-side token if implemented.

# Styling Rules

Design tokens live in `src/styles/global.css`. Use restrained dark surfaces, fine borders, precise spacing, strong typography, and subtle cyan/blue accents. Do not introduce one-note palettes, excessive neon, or decorative clutter.

Responsive layouts must be intentional at mobile, tablet, and desktop sizes. Text must not overflow containers.

# Animation Rules

Use one coherent motion system. Avoid excessive animation, scroll-jacking, gratuitous particles, competing visual effects, and animation that harms usability.

# Performance Rules

- Lazy-load expensive scenes.
- Pause or unmount offscreen rendering.
- Use adaptive DPR.
- Dispose Three.js resources where manual resources are created.
- Optimize assets.
- Avoid unnecessary rerenders.
- Keep mobile GPU performance in mind.

# Accessibility Rules

- Use semantic HTML.
- Preserve keyboard support.
- Keep visible focus states.
- Respect reduced motion.
- Provide WebGL fallbacks.
- Maintain sufficient contrast.

# Content Rules

Do not fabricate employers, projects, technologies, dates, metrics, job titles, education, certifications, contact information, clients, awards, or GitHub repositories. If factual information is unavailable, leave it out or clearly mark it for Andres to provide.

# Validation

Run:

```bash
npm run lint
npm run build
```

Also verify desktop and mobile behavior, navigation links, WebGL fallback, reduced-motion behavior, and content accuracy.
