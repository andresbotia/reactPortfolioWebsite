# Portfolio Rebuild — Pass 1

Design plan and agreed decisions for the andresbotia.com rebuild. Written before any
production code exists, as the durable record of what was agreed.

**Status:** plan drafted; all design and infrastructure decisions resolved (§7). Blocked on
two content gaps before the Experience section can be written (§8): the truncated Foot Locker
description, and whether any role carries a real metric.

---

## 1. Ground truth

Everything below was read or measured, not assumed.

### 1.1 factory.ai — extracted from shipped CSS

Pulled the raw HTML and both CSS bundles (262 KB + 4 KB) rather than a text conversion.

**The type scale is not a scale.** The entire hero derives from one fluid unit, and every
other value is a ratio of it:

```
U = clamp(min(calc((100vw - 2rem) * 0.0656), 1.625rem), 3.4vw, 4rem)

section padding-top     U × 1.6
section padding-bottom  U × 1.0
logo   margin-bottom    U × 0.47
h1     font-size        U
sub    margin-top       U × 0.234
sub    font-size        max(0.6875rem, U × 0.309)
```

The hero has no spacing system — it has one number and a set of proportions. That is why it
holds at every width, and it is a materially different way to build than a t-shirt scale.

**Typefaces.** Three: `Geist` (variable 100–900), `Geist Mono`, and a custom
`Geist Pixel Square` bitmap face used sparingly. **No serif anywhere.** Metric-matched
fallbacks are shipped so the font swap causes zero CLS:

```css
@font-face {
  font-family: Geist Fallback;
  src: local("Arial");
  ascent-override: 95.94%;
  descent-override: 28.16%;
  line-gap-override: 0%;
  size-adjust: 104.76%;
}
```

**h1 specifics.** `font-weight:500`, `line-height:1`, `letter-spacing:-0.04em`,
`text-transform:uppercase`, `color:#020202`, `word-spacing:0.404em`. Two lines of headline
plus one mono line — that is the whole hero.

**Palette.** Light-default; neutrals are warm-tinted, not grey.

```
--dark-base-primary   #020202      --surface-page    #f5f5f5
--dark-base-secondary #101010      --surface-raised  #ffffff
--light-base-primary  #eeeeee      --surface-sunken  #ebebeb

neutrals  #d6d3d2 #ccc9c7 #b8b3b0 #a49d9a #8a8380
          #5c5855 #4d4947 #3d3a39 #2e2c2b #1f1d1c

accent    #ef6f2e  #ee6018  #d15010     ← borders only, never fills
```

Note `#020202` — actual black, not `#0B0B0B`.

**Borders, radius, container.** Hairlines are 1px in mid-greys, not white-alpha. Radius is
aggressively small: `--radius:.375rem`, but buttons use `rounded-sm` = **3px**. Nothing is
pill-shaped, nothing is 12–16px rounded. Buttons are `h-[25px]` and `h-[31px]`.
`--content-column:1440px`; gutters step `1rem → 1.5rem → 2.25rem → 5rem`.

**Motion.** 34 named keyframes, every one component-specific and event-driven
(`accordion-down`, `megamenuSlideDown`, `home-hero-intro`, `pageTransitionIn`). **No
scroll-triggered animation anywhere.** Durations cluster at 100/150/200/250/300 ms. Three
techniques worth taking:

- **Nav hover** — hovering the list drops *all* siblings to `opacity:.6` while the hovered
  item stays at 1.
- **Link underline** — an `::after` 1px bar animating `width: 0 → 100%` over 300 ms. Not a
  colour change, not an arrow.
- **Button hover** — a 45° `repeating-linear-gradient` hatch at 7.07px sliding via
  `slidePattern 2000ms linear infinite`. A pattern, not a shadow, not a lift.

They also carry a `--dither:4px` token, so the texture strategy is deliberate.

### 1.2 This repo — verified

Confirmed: Vite 8 / React 19.2 / TS 6, `@react-three/fiber` + `three`, plain CSS custom
properties, Vercel. **No router** — one page, six sections mounted in `src/App.tsx`.
`playwright` is already a devDependency.

Four things that are not as documented:

| | |
|---|---|
| **Stale docs** | `AGENTS.md` names `src/three/scenes/HeroScene.tsx` and `ScrollVoxelField.tsx` as the primary scenes. **Neither file exists.** The only scene is `DitherBackground.tsx`. Update `AGENTS.md` in Pass 2. |
| **Font bug** | `src/styles/global.css:21` declares `--sans: Inter, …` but there is no `@font-face` and no font link in `index.html`. **The live site renders in Segoe UI** and has no typographic identity at all. |
| **API works** | `/api/github-stats` returns 200 — 13 repos, 170 commits this year, 1 star. |
| **No OG image** | There is no `og:image` file, yet `twitter:card=summary_large_image` is set. **Every share renders a blank card.** |

**Banned patterns currently shipping:** tracked-uppercase mono eyebrows (`.eyebrow`,
`SYSTEMS`); the slash meta string `Software engineer / Florida`; `border-radius:999px` pills
on every button and tag; identical `--radius:8px` cards sharing one `--edge-glow` shadow;
`translateY(-2px)` hover lift on every button; radial gradient washes on `body`; `#05070b`
tinted near-black as the ground.

### 1.3 SEO — both bugs confirmed by live request

```
GET https://andresbotia.com/      → 308  Location: https://www.andresbotia.com/
GET https://www.andresbotia.com/  → 200  Content-Length: 1584

served head:  <link rel="canonical" href="https://andresbotia.com/">
served body:  <div id="root"></div>
```

- **Canonical mismatch.** The host that serves is `www`; the canonical points at the host
  that 308s away. `public/robots.txt` and `public/sitemap.xml` also both hardcode the apex,
  so they point at a redirect too.
- **Empty shell.** 1584 bytes total, zero content, no JSON-LD of any kind.

### 1.4 Orbital

README read in full. Specifics worth using beyond the brief: PocketWorld is the unified feed
provider (aggregating ADS-B, Where the ISS at?, USGS/EMSC, NOAA/NHC, NASA EONET, NASA DONKI,
Space-Track); CelesTrak GEO/OneWeb groups come through cached serverless proxies on a 6h
cache with a 24h stale window; SGP4 propagates every 4s and interpolates at a throttled
15 FPS; satellite positions are explicitly framed as TLE-derived estimates rather than live
GPS. Live deploy returns 200.

---

## 2. Colour

| token | hex | role | contrast on ground |
|---|---|---|---|
| `--ground` | `#000000` | Page background, everywhere. Actual black. | — |
| `--signal` | `#F2F0ED` | Headlines, `h1`, emphasis. Warm off-white. | **18.7 : 1** |
| `--read` | `#8C8681` | Body copy, all prose. Warm mid-grey. | **5.84 : 1** ✅ AA |
| `--rule` | `#4A4542` | Hairlines, dividers, borders. | **2.21 : 1** — non-text only, by rule |
| `--instrument` | `#7FB6FF` | Hero glyph hue. Links, live states. Nothing else. | **10.0 : 1** |

Computed, not eyeballed. Re-verified and reported in Pass 2.

Two decisions worth defending. **Ground is true `#000000`**, not a tinted near-black — the
hero glow only works if the falloff terminates in real black. **The greys are warm and the
accent is cool;** that single opposition is the whole colour idea. The page is warm-neutral
and the one thing that glows is cold, which is what makes the hero read as a *light source*
rather than a coloured area.

One raised surface only, for project imagery: `#141210`. That *is* a tinted near-black,
deliberately — a second surface *against* black, not a substitute for it.

---

## 3. Type

**Display: Newsreader**, variable, `opsz 72`, weight **300** only.

Not Instrument Serif — that is the current default for exactly this look and is instantly
recognisable as such. Newsreader has a real optical-size axis, so the display cut is an
*actual* display cut (thinner hairlines, tighter fit) rather than a text face scaled up. At
300 / opsz 72 it gives genuine high stroke contrast without the fashion-magazine Didone
flavour. The honest justification: it is the sharpest available free serif set against a
monospaced glyph field, and that collision is the point.

**Text + data: IBM Plex Sans / IBM Plex Mono** (one superfamily, two cuts). IBM Plex is IBM's
corporate type family and Andres writes RPG ILE on IBM i. Anyone in that world clocks it;
everyone else reads a very good grotesque.

**Mono has one hard rule: it is only ever used for a value — a number, a date, a coordinate,
a machine identifier. Never for a word-label.** That is what keeps it from being decorative.

**Weights used, total: four.** Newsreader 300. Plex Sans 400, 500. Plex Mono 400.

### Scale

Taking factory.ai's real lesson — one fluid unit, ratios off it — but **only in the hero**.
Body text is fixed-size, because reading text should not scale with viewport width.

```
--u: clamp(2.75rem, 9vw, 5.5rem)        /* 44px @390  →  88px @1440 */

h1      var(--u)                        Newsreader 300   lh .92    ls -.03em
h2      clamp(1.75rem, 4vw, 2.75rem)    Newsreader 300   lh 1.05   ls -.02em
h3      1.25rem                         Plex Sans 500    lh 1.25   ls -.01em
lead    1.125rem                        Plex Sans 400    lh 1.55   max 58ch
body    1rem                            Plex Sans 400    lh 1.65   max 62ch
value   0.8125rem                       Plex Mono 400    lh 1.4
micro   0.6875rem                       Plex Mono 400    ls .02em  sentence case

hero rhythm as ratios of --u:
  pad-top ×1.9   h1→lead ×0.30   lead→links ×0.42   pad-bottom ×1.2
```

Self-hosted, subset to latin, `font-display:swap` with `size-adjust` / `ascent-override`
fallback metrics per factory.ai's technique — zero CLS on swap.

---

## 4. Layout

**Alignment logic: one vertical hairline at a fixed x, identical on every section, never
moving.** Left of it, an 8rem measurement column in mono carrying only real data. Right of
it, content. Because the rule never shifts, scrolling reads as one continuous document rather
than five stacked section templates. Below 900px the column collapses to a single mono line
above its content.

Nothing in that column is decorative, and nothing is numbered `01 / 02 / 03` — the sections
are not sequential, so numbering them would be a lie.

### Hero — type left, glyph field right, bleeding past the frame

```
┌───────────────────────────────────────────────────────────────┐
│ andres botia          work   experience   contact      resume │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│                                  ░▒▓█ ▓▒░                     │
│   Andres Botia                 ▒▓███████▓▒  ·                 │
│   ─────────────────           ░▓█████████▓░                   │
│   Software engineer. I put    ▒▓██  ███  █▓▒                  │
│   modern interfaces on         ▓███ ███ ███▓                  │ ← bleeds
│   systems that were never      ░▓█████████▓░                  │   past edge
│   meant to have them.           ▒▓███████▓▒                   │
│                                   ░▒▓█▓▒░                     │
│   Work    Résumé                                              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Work — Orbital as a case study, the rest as a list

```
 live          │  Orbital
 2026          │  ──────────────────────────────────────────────
 react · ts    │  Real-time visualisation of activity across
 three.js      │  Earth and near-Earth space.
               │
               │  ┌──────────────────────────────────────────┐
               │  │  [ captured video loop from live site ]  │
               │  └──────────────────────────────────────────┘
               │
               │  ── The problem            ─────────────────
               │  ── What it does           ─────────────────
               │  ── Engineering            ─────────────────
               │      one draw call per category
               │      screen-space decluttering
               │      SGP4 propagation, throttled
               │      lazy Natural Earth, distance crossfade
               │      adapters isolate providers
               │      status from real fetch timestamps
               │
               │  Live site        Source
 ══════════════╪════════════════════════════════════════════════
 2026          │  Yearly Tracker        offline-first habit app
 2025          │  Grand Slam Insights   MLB model dashboard
```

### Experience — the through-line as a measured axis

```
 2021 ─┬─      │  Foot Locker              Core Retail Intern
       │       │  CI/CD, instrumentation, monitoring
       │       │
 2022 ─┼─      │  Cendyn                   Boca Raton, FL
       │       │  Intern → Associate Software Engineer
       │       │  C# / .NET Framework
       │       │
 2024 ─┼─      │  Banyan Air Service       Fort Lauderdale, FL
       │       │  Apprentice → Software Engineer
       ▼       │  RPG ILE IV on IBM i · React · React Native
 now  ─┴─      │
```

The left rail is a real, proportional time axis — 2021→now is drawn to scale. The reader sees
the five-year arc as a *length* in about two seconds, then reads one role in depth. The
through-line (legacy enterprise → modern interface, in every single role) becomes visible
from the tech listed along the axis without anyone having to state it.

**Contact** — one line, an email, two links. No panel, no card, no gradient.

---

## 5. Motion — the complete list

| what | when | why |
|---|---|---|
| hero canvas | continuous, ~90 s / rev | The only continuous motion on the page. |
| glyph fade-in | load, 900 ms | One orchestrated moment. The `h1` does **not** animate — it is the LCP element. |
| nav hover | 200 ms | Siblings drop to `opacity:.6`, hovered stays 1. |
| link underline | 240 ms | `width: 0 → 100%`. No arrows, anywhere. |
| project media | on click | Nothing on hover. Click plays. |
| reduced motion | — | Canvas paints one composed frame; every duration → 0. |

**Nothing animates because you scrolled past it.** There are no entrance animations on any
section.

### Principles

- The page is set the way an engineering document is set: one rule, one axis, every number
  real.
- The most differentiated fact here is moving between an AS/400 and React Native in the same
  week. The layout makes that visible as a shape before any sentence claims it.
- Mono means a value. Serif means a heading. Nothing is monospaced for texture.
- All boldness is spent on the hero. Everything after it is quiet on purpose, and the
  quietness is the argument.
- Nothing on the page is a metaphor for instrumentation. Either it displays a real datum or
  it isn't there.

---

## 6. Self-critique — what changed before the plan was shown

Asked of each choice: *would I have produced this for any portfolio brief?* Six times yes.

| first pass | revised to | because |
|---|---|---|
| `#7BDCFF` | `#7FB6FF` | The first is the current site's cyan and the default "tech blue." Desaturated, it reads as *light* on black rather than as a colour — which is what "brightness carries the form" requires. |
| Instrument Serif | Newsreader 300 | Instrument Serif is the default serif for this exact aesthetic right now. |
| JetBrains Mono | IBM Plex | Every developer portfolio. Plex is correct *only* for someone who writes RPG on IBM i. |
| Earth | turbofan | See §7.1. |
| `01 / 02 / 03` | cut | Decorative numbering of non-sequential things. |
| timeline + dots | proportional date axis | A dotted timeline is every portfolio ever made. A scaled axis makes the five-year span legible as a length. |

**Flagged as a possible weakness, not changed.** The left-rail-plus-content structure is
itself a reasonably common editorial shape. The defence is that the rail is load-bearing here
— a real axis in Experience, real metadata in Work — rather than a place to park labels. If
it drifts into decoration during the build, it should be cut.

---

## 7. Decisions

### 7.1 Hero subject — **B, the turbofan.** ✅ decided

A turbofan seen head-on, rotating: blades sweep around a bright hub, radial falloff into
black at the cowling.

Rationale, including the argument that settled it:

- **Orbital *is* a globe, and it is the lead case study with real captured imagery.** A globe
  hero above a globe case study means the page opens with a duplicate of its own best
  content. This is the deciding reason.
- It is Andres's world in a way the globe isn't. A globe belongs to Orbital; an engine
  belongs to Banyan and five years of aviation work.
- Radial symmetry read head-on is unmistakable at any size. It survives 390px, and it
  survives a 96px favicon. Anything with thin structure (orbital rings) aliases into noise at
  mobile width and is disqualified by the brief's own test.
- Rotation about the view axis is the one motion that stays clean in a glyph grid — cells
  don't shear, so there is no crawl or wobble.
- The thesis argument: a turbofan is an old machine rendered by a modern one. That is the
  whole site in one image.

**Technique.** Subject luminance renders to an offscreen buffer at one texel per glyph cell.
Cells ~10px at ≥1024px (≈144×72 ≈ 10.4k) and ~8px at 390px (≈49×85 ≈ 4.1k). Glyphs are
pre-rendered once into a **sprite atlas at 16 brightness levels**, so the per-frame loop is
pure `drawImage` — no `fillText`, no per-cell state changes. Bloom via a second
`globalCompositeOperation:'lighter'` pass on the brightest cells only. **Banding is killed by
dithering luminance with per-cell blue noise (±½ step) before quantising to the ramp** —
which also destroys the uniform-brightness plateau in the same move, nearly free.

**The character ramp will be measured, not assumed.** Rasterise each candidate in IBM Plex
Mono at target size, compute mean alpha coverage per glyph, pick ~12 at even intervals. Block
glyphs (`░▒▓█`) fall back inconsistently across systems, so candidates stay ASCII plus a few
safe Latin-1. The derived ramp and its coverage numbers get reported before it is wired in.

**Degradation is structural.** The hero is a two-column grid: `h1` left, canvas right. If
canvas init fails, the right column is empty black and the layout is byte-identical — a
well-set headline on black. That also means **zero CLS by construction**, not by reserving a
height.

**Kill criterion.** If the field is muddy, banded, or below frame budget after honest effort,
it gets cut and replaced with a well-set headline, and that is reported rather than shipped
degraded.

### 7.2 Canonical host — **apex** (`andresbotia.com`). ✅ decided

`https://andresbotia.com/` is authoritative. Everything else 301s to it.

**This requires changing the primary domain in the Vercel project's Domains settings** — the
current apex→www 308 is configured at the project level, not in `vercel.json`. Editing
`vercel.json` alone will not fix it. The `vercel.json` redirect is added as the second half,
and the result is verified with a real `curl` before the task is called done.

`public/robots.txt` and `public/sitemap.xml` already declare the apex, so they become correct
once the primary domain flips.

### 7.3 Projects — **cut both weak entries.** ✅ decided

Cut **Photography Portfolio** (2020, static HTML/SCSS — predates the career) and the
**Twitter Revenue Chrome extension** (a button replacement). Three strong entries beat five
uneven ones.

Shipping list: **Orbital** (lead case study), **Yearly Tracker**, **Grand Slam Insights**.

### 7.4 Stack and GitHub sections — **fold Stack, remove GitHub.** ✅ decided

- `Stack` folds into Experience. Skills belong to the roles that produced them; a standalone
  tag cloud is filler.
- The GitHub stats section is **removed entirely**, not demoted to the footer. 13 repos and
  170 commits invites a judgment that is not worth inviting from a recruiter.
- `api/github-stats.ts` and `src/hooks/useGitHubStats.ts` get deleted in their own commit.

### 7.5 Prerendering — **`react-dom/server` at build time. No browser.** ✅ decided, revised

The earlier Playwright proposal was wrong and is withdrawn. The objection is correct: Vercel's
build image ships no browsers, `npx playwright install --with-deps` needs root that Vercel
builds do not have, and even the bare `playwright install` pulls ~130 MB into
`~/.cache/ms-playwright`, which Vercel does not cache between builds. It would add time and a
flake class to every deploy.

The better answer is that **this site does not need a browser to prerender.** All content
lives in `src/data/` as static TypeScript. There is no data fetching required at build time
and no route that depends on runtime state. So:

1. `vite build` — the client bundle, as today.
2. `vite build --ssr src/entry-server.tsx` — a second, tiny SSR bundle.
3. A ~30-line Node script calls `renderToString(<App />)`, injects the markup plus the
   per-route `<title>` / meta / JSON-LD into `dist/index.html`, and writes it back.
4. `src/main.tsx` switches from `createRoot` to `hydrateRoot`.

Properties: **zero new dependencies** (`react-dom/server` ships with React), runs identically
on Vercel and locally, deterministic, ~2 seconds, no browser download, no flake class.

Hydration is where this pattern actually breaks, so four constraints are binding on the build.

**a. Nothing browser-dependent is read during render.** No `new Date()`, `Math.random()`,
`window`, or `matchMedia` in the render phase — and specifically **not in a lazy `useState`
initializer**, which runs during render and reads as safe but isn't.

`src/hooks/useWebGLSupported.ts` is a live example of exactly that bug today:
`useState(detectWebGL)` returns `false` on the server (guarded on `typeof document`) and
`true` on the client, so server and client render different branches. The component is deleted
at build step 4, but the hero needs the same capability check, so the replacement detects in
an effect.

**b. Reduced motion is handled in CSS, not JS.** `@media (prefers-reduced-motion: reduce)` is
evaluated by the browser before first paint, has zero hydration surface, and works with JS
disabled. The JS hook survives only where CSS cannot reach — deciding whether the RAF loop
starts — and even there `matchMedia` is read inside the effect, never during render.

`src/hooks/useReducedMotion.ts` is already correct in this respect (`useState(false)` plus an
effect). The CSS-first rule is the stronger version, and it also removes a flash the JS-only
approach causes: a reduced-motion user would otherwise get one animated frame before the
effect flips the state.

**c. No `React.lazy` anywhere in the tree `renderToString` walks.** `renderToString`'s
behaviour with an unresolved lazy module is version-dependent and not worth depending on in
either direction. The only `lazy()` in the repo today is
`src/components/layout/ScrollBackground.tsx:7`, wrapping `DitherBackground`, which is deleted
at step 4.

What the hero needs is **client-only mounting**, not code-splitting-with-suspension:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);
return <div className="hero-field" aria-hidden="true">{mounted ? <GlyphField /> : null}</div>;
```

The container ships in the server HTML — so the grid column is reserved and there is no CLS —
while the canvas does not. If the glyph-field module should also stay out of the initial
bundle, that is a bare `import()` **inside the effect**: no Suspense, no render-phase
suspension, no SSR surface.

**d. The script writes every route, and the route list is shared with the sitemap.** The
script takes a route array and writes `dist/<route>/index.html` for each. **That same array
generates `sitemap.xml`,** so a route cannot be listed in the sitemap and left unprerendered —
a structural guarantee rather than a matter of discipline.

Today that array is `["/"]`. There is genuinely one route: `Navigation.tsx` links are in-page
anchors (`#work`, `#contact`, …), `App.tsx` mounts every section on one page, there is no
router, and `public/sitemap.xml` contains a single `<loc>`.

**Failure is loud.** After writing, the script asserts each output contains `Andres Botia` and
clears a minimum byte floor, and exits non-zero otherwise — so a silently empty prerender
fails the Vercel build instead of deploying an empty shell. Verified additionally by `curl`
against the built output, confirming name, headline, roles, and project copy are present as
real text.

**Playwright stays a devDependency for local screenshots only, and never enters the deploy
path.**

---

## 8. Open questions — blocking Pass 2

The Experience section cannot be written without these. No gaps get papered over.

1. **Foot Locker — description truncated.** LinkedIn text cuts off at "Contributed to
   implementing CI/CD, instrumentation, and monitoring on key systems." Need the rest.

2. ~~**Cendyn, System Analyst Intern (Oct 2021 – May 2022) — no description.**~~ ✅ **Resolved.**
   Folds into a single Cendyn tenure as title and dates only. It ran eight months and
   converted into the Associate Software Engineer role, so the progression is the fact worth
   showing; an invented paragraph would be worse than a clean line.

3. **Metrics — no role carries a measurable outcome.** Two specific numbers are worth
   checking before answering "nothing," because both are real, and neither requires
   permission to state:
   - roughly how many people use the **Banyan Executive Dashboard**;
   - roughly how many **RPG programs or business systems** are maintained.

   If neither can be stood behind, the section ships without numbers rather than
   manufacturing them.

Also outstanding, non-blocking:

4. **`og:image`** — none exists today, so every share renders blank. Proposed 1200×630:
   *Andres Botia* in Newsreader, *Software engineer* in Plex Mono, one still frame of the
   glyph field, on black.

---

## 9. Copy — approved

> **Andres Botia**
>
> Software engineer. I put modern interfaces on systems that were never meant to have them.

Positioning to preserve: IBM i / RPG and aviation technology stay in the meta description.
That specificity is the differentiator and does not get sanded into "full-stack engineer."

---

## 10. Build order for Pass 2

Each numbered item is its own commit.

1. Design tokens and self-hosted fonts (fixes the never-loaded `Inter` bug).
2. Hero: layout, `h1`, copy, reserved canvas column — **without** the glyph field.
3. Glyph field: ramp measurement, sprite atlas, dither, bloom, RAF gating, reduced-motion
   static frame.
4. Remove `DitherBackground` and the WebGL background — deliberately, only once the new hero
   works.
5. Work: Orbital case study with captured imagery, plus the two-item list. Cut the two dropped
   projects from `src/data/projects.ts`.
6. Experience: rebuilt from LinkedIn text, once §8 is answered. Stack folded in.
7. Remove the GitHub section, hook, and serverless function.
8. SEO: canonical/apex, prerender, `Person` + `CreativeWork` JSON-LD, sitemap, robots, OG
   image.
9. `AGENTS.md` corrected (stale scene filenames).

Gates on every commit: `npm run lint` and `npm run build` clean, screenshots at 1440px and
390px, and a pass against the banned-patterns list.
