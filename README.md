# AndresBotia.com

A premium personal software-engineering portfolio for Andres Botia. The site presents modern interfaces connected to complex real-world systems, with subtle aviation-inspired route, telemetry, and waypoint visuals.

## Tech Stack

- React
- Vite
- TypeScript
- Three.js
- React Three Fiber
- Lucide React
- ESLint
- Playwright for local browser verification
- CSS custom properties and plain CSS

## Getting Started

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm run preview
```

Validation:

```bash
npm run lint
npm run build
```

## Project Structure

```text
src/
  components/
    layout/        Navigation and footer
    ui/            Reusable UI primitives
  data/            Profile, project, experience, and skill content
  hooks/           Motion, WebGL, and viewport helpers
  lib/             Error boundaries and shared utilities
  sections/        Page sections
  styles/          Global design system
  three/
    scenes/        WebGL hero and scroll voxel scenes
    utils/         Reserved for Three.js helpers
```

## ThreeUI

ThreeUI Community was used as an implementation reference, not as a copied visual template. The adapted concepts are lazy isolated canvases, adaptive DPR, paused offscreen rendering, WebGL fallback behavior, and restrained procedural route motion.

ThreeUI Community is MIT licensed. No ThreeUI source files or assets are redistributed here.

## Performance

The site uses isolated WebGL canvases for the hero and scroll-reactive voxel background. Both are lazy-loaded, use capped DPR, and drop to static fallback behavior when reduced motion or missing WebGL is detected.

## GitHub Stats

The GitHub section fetches public GitHub REST API data for `andresbotia` through a cached Vercel function at `/api/github-stats`, with a browser-side fallback for local Vite development. The public commit count reflects authored commits in public repositories for the current year; private contribution-calendar totals still require authenticated GraphQL access.

## Accessibility

The page uses semantic sections, keyboard-accessible links/buttons, visible focus states, sufficient contrast, `prefers-reduced-motion`, and a non-WebGL fallback. Content and navigation remain available without WebGL.

## Deployment

This is a static Vite application intended for deployment on Vercel at `https://andresbotia.com`. `vercel.json` pins the build command to `npm run build` and the output directory to `dist/`.
