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

The GitHub section fetches public GitHub REST API data for `andresbotia` at runtime. The official contributions calendar is not fetched client-side because it requires authenticated GraphQL access; add a server function if contribution history needs to be shown without exposing a token.

## Accessibility

The page uses semantic sections, keyboard-accessible links/buttons, visible focus states, sufficient contrast, `prefers-reduced-motion`, and a non-WebGL fallback. Content and navigation remain available without WebGL.

## Deployment

This is a static Vite application intended for deployment at `https://andresbotia.com`. The repository currently has no `.openai/hosting.json`, so no managed hosting project is linked from the workspace. Build output is generated in `dist/`.
