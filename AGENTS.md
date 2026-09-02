# Project

AndresBotia.com is the personal portfolio for Andres Botia. The positioning is
specific and worth protecting: modern interfaces on systems that were never
meant to have them — RPG ILE IV on IBM i talking to React and React Native,
aviation operations, live telemetry. Do not sand that down into "full-stack
engineer".

The design plan, the decisions behind it and the reasoning for each are in
`PLAN.md`. Read it before changing anything structural.

# Architecture

React + Vite + TypeScript. No router: one page, sections mounted in `App.tsx`.

- `src/data/` — all factual content. Content changes must never require
  touching component code.
- `src/site.ts` — identity, route list, JSON-LD, sitemap and robots. The route
  array drives both the prerender and the sitemap, so the two cannot diverge.
- `src/sections/` — one folder per section, with its CSS beside it.
- `src/styles/` — `tokens.css` (design tokens), `fonts.css` (self-hosted faces
  and their metric-matched fallbacks), `band.css` (the shared section spine),
  `global.css` (base only).
- `scripts/` — build and dev tooling.

# Commands

```bash
npm run dev
npm run lint
npm run build     # tsc, client build, SSR build, prerender
npm run preview
```

`npm run lint` and `npm run build` must both pass before work is complete.

# Design

Restraint applied to technical subject matter. Confident, spacious, quiet.

- **Palette, five values.** `--ground #000000` (true black, not a tinted
  near-black — the hero's falloff has to terminate in real black), `--signal
  #F2F0ED`, `--read #8C8681`, `--rule #4A4542` (non-text only, 2.21:1),
  `--instrument #7FB6FF`. The greys are warm and the accent is cool; that
  opposition is the whole colour idea.
- **Two families.** Newsreader at `opsz 72` weight 300 for display only. IBM
  Plex Sans and Mono for everything else — Plex because Andres writes RPG on
  IBM i, which is the kind of reason a choice should have.
- **Mono is for values only**: a number, a date, a coordinate, an identifier.
  Never a word-label. This is what stops it becoming decoration.
- **One spine.** A hairline at a fixed x on every section, a rail of real data
  to its left. Nothing in that rail is decorative.
- **Boldness is spent once**, in the hero. Everything downstream stays quiet.

## Banned

These are the tells of generated design. Do not reintroduce them:
tracked-uppercase eyebrow labels; one word in a headline accented in another
colour; meta strings joined with middle dots or slashes; `WORD — fragment`
labels; arrows glued to links; identical rounded cards sharing one radius and
one soft shadow; gradient washes as decoration; fade-and-slide-up on every
section; hover lift on every card; tinted near-black standing in for black;
monospace on every small label; filler copy ("passionate about", "crafting
experiences", "let's build something together").

# Content

Do not fabricate employers, projects, technologies, dates, metrics, titles,
education, certifications, contact details, clients, awards or repositories.
Every claim in `src/data/experience.ts` is traceable to Andres's own words. No
role carries a metric because none was available, and "the entire executive
team" is deliberately not converted into a headcount. If something is missing,
ask him — do not fill the gap.

# Motion

The complete list: the hero glyph field rotates; the field fades up once on
load; nav siblings dim on hover; link underlines grow; the Orbital mode
switcher responds to clicks. That is all. **Nothing animates because the user
scrolled past it.**

Reduced motion is handled in CSS, at the token level, so it is evaluated before
first paint and works with JS disabled. The only JS read of `matchMedia` decides
whether the hero's rAF loop starts, and it happens inside an effect.

# The hero

`src/sections/Hero/turbofan.ts` renders a turbofan as a glowing glyph field on
one canvas with a sprite atlas — no DOM grid. Constraints that are load-bearing
and expensive to rediscover:

- Blade sweep must stay under one blade pitch. More than that and the blades
  smear across their neighbours and the disc interferes into noise.
- The blade profile is a duty cycle, not a cosine power. A cosine reads as a
  starburst.
- The character ramp was measured, not chosen by eye. Re-measure before
  changing it.
- Luminance is dithered before quantising. That is what removes both the
  banding and the flat plateau at the core.
- Density adapts to measured frame cost, because the cost is fill-rate bound
  and varies by an order of magnitude across real GPUs.
- Measure performance on a real GPU. Headless Chromium rasterises in software
  and reports frame times that say nothing about what users see.

# Rendering and SEO

The site prerenders with `react-dom/server` at build time. **No headless
browser in the build** — Vercel's build image ships none, cannot cache one and
has no root to install system libraries with. Playwright is a devDependency for
local screenshots and the OG image only; it must never enter the deploy path.

Four rules keep hydration sound:

1. Nothing browser-dependent is read during render — no `window`, `matchMedia`,
   `new Date()` or `Math.random()`, **and not in a lazy `useState` initialiser**,
   which runs during render and reads as safe but is not.
2. Reduced motion is CSS, not JS.
3. **No `React.lazy` in the tree `renderToString` walks.** Client-only pieces
   mount inside an effect; code-splitting uses `import()` inside that effect.
4. The build asserts every prerendered page contains real content and clears a
   size floor, and exits non-zero otherwise.

The build month is baked in via `define` in `vite.config.ts` so date-dependent
rendering stays deterministic.

# Accessibility and quality

Semantic HTML, one `h1`, no skipped heading levels, visible focus on every
interactive element, WCAG AA contrast (computed, not eyeballed), responsive
from 320px, no console output in production.

# Deployment

Vercel, Git-based from `main`. The apex `andresbotia.com` is authoritative and
`vercel.json` 301s www to it — but the redirect direction is ultimately the
project's primary-domain setting in the Vercel dashboard, not this file.
