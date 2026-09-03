# Portfolio Rebuild — Pass 1

Design plan and agreed decisions for the andresbotia.com rebuild. Written before any
production code exists, as the durable record of what was agreed.

**Status:** built and shipped. Pass 2 complete — see §11 for measured results and §12 for
the two items that remain in Andres's hands. §13, §14 and §15 record later rounds of work.

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

## 8. Content gaps — all resolved

No gap was papered over. Source text below is Andres's own; nothing is inferred.

1. ✅ **Foot Locker — Core Retail Internship, May–Jul 2021.** Supplied:

   > Contributed to CI/CD, instrumentation, and monitoring on key internal systems, and
   > worked on automation across retail site operations.

2. ✅ **Cendyn, System Analyst Intern (Oct 2021 – May 2022).** Folds into a single Cendyn
   tenure as title and dates only. It ran eight months and converted into the Associate
   Software Engineer role, so the progression is the fact worth showing; an invented
   paragraph would be worse than a clean line.

3. ✅ **Metrics.** Answered, and the answer is not a number. No invented figures ship, and
   "the entire executive team" is **not** converted into a headcount. The Banyan Executive
   Dashboard adoption story (§8.1) is the proof point, and it is stronger than a metric would
   have been.

4. **`og:image`** — non-blocking, still to make. Proposed 1200×630: *Andres Botia* in
   Newsreader, *Software engineer* in Plex Mono, one still frame of the glyph field, on black.

### 8.1 Banyan Executive Dashboard — source material

Andres's own account, verbatim in substance:

> Self-initiated, not assigned. Pulls live flight data from FlightAware and cross-references
> it against reservations and fueling records to surface financials and flag flights that
> didn't come through — work that was previously done by hand, someone manually checking and
> writing down discrepancies. Now used daily by the entire executive team.

**Drafted copy for the site:**

> **Banyan Executive Dashboard**
>
> Built unprompted. Pulls live FlightAware data, cross-references reservations and fueling
> records, and surfaces the financials — including flights that never came through. That
> reconciliation was done by hand before. The executive team uses it daily.

**Placement: inside Experience, given structural weight — not a second Work case study.**
Considered and rejected as a case study for two reasons:

- **It cannot carry the format.** Orbital has a live URL, public source, and captured
  imagery. The dashboard runs on customer flight data, reservations, fueling records, and
  financials, so there is nothing publishable — no link, no source, no screenshots. A case
  study format promises evidence; an image-less block sitting beside Orbital's video loop
  reads as the weaker of the two, which inverts the truth.
- **Its power is the context.** Unprompted, inside a company, adopted at the top. Lifting it
  into Work strips exactly that. Work says what was made; Experience says what changed
  because he was there. This is the second kind of thing, and the strongest instance of it.

**It also solves the hardest problem in this section.** The brief flagged that the two Banyan
titles describe near-identical work. The honest difference is not wording — it is that the
dashboard is **self-initiated**, and taking on unprompted, production-adopted work is
precisely what separates the engineer role from the apprentice role. The progression is shown
by a fact rather than by rewording the same paragraph twice.

It therefore gets its own headed block within the Banyan tenure, not a bullet, and it is the
hinge between the two titles.

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
6. Experience: rebuilt from the §8 source text, with the Executive Dashboard as a headed
   block inside the Banyan tenure and the hinge between its two titles. Stack folded in.
7. Remove the GitHub section, hook, and serverless function.
8. SEO: canonical/apex, prerender, `Person` + `CreativeWork` JSON-LD, sitemap, robots, OG
   image.
9. `AGENTS.md` corrected (stale scene filenames).

Gates on every commit: `npm run lint` and `npm run build` clean, screenshots at 1440px and
390px, and a pass against the banned-patterns list.


---

## 11. Results

Measured against the built site, not asserted.

### Lighthouse

| | |
|---|---|
| Performance | **98** |
| Accessibility | **100** |
| Best practices | **100** |
| SEO | **100** |

LCP 2.4s · **CLS 0** · TBT 50ms · FCP 1.4s · Speed Index 1.4s.

Lighthouse is a lab tool and does not produce INP, which is a field metric. The lab proxy is
TBT (50ms). Directly measured, the page's only interactive control — the Orbital mode
switcher — goes from click to next paint in 33.4ms median, 33.5ms max, i.e. one frame.

Two findings from the first run were real bugs and were fixed rather than explained away:

- **26 nodes failed colour contrast at 2.22:1.** `tokens.css` documents `--rule` as
  hairlines-only-never-text, and four stylesheets then used it as a text colour. Added
  `--dim #7a756f` at 4.60:1. Accessibility went 95 → 100.
- **CLS was 0.017 on `.hero__field`.** The "zero CLS by construction" claim covered the
  canvas — the box is reserved — but not the lead paragraph above it, which reflowed when
  IBM Plex Sans swapped in. Metric-matched fallbacks hold line-box height without
  guaranteeing identical line breaks. Preloading Plex Sans took CLS to 0.

### Hero

Measured on a real GPU. Headless Chromium rasterises in software and reported 100ms frame
gaps that were compositing, not the render loop.

- `draw()` 3.8ms median, 5.3ms p95 at 1440; 3.0ms at 390 — against a 33.3ms budget at 30fps.
- rAF locked at 16.7ms, max 16.8ms: no dropped frames.
- Reduced motion draws exactly one frame and leaves the loop idle, verified by cell count
  holding steady across 2.5s.

### Weight

| | before | after |
|---|---|---|
| JS | 1108 KB (306 gz) | 209 KB (67 gz) |
| CSS | 22.1 KB | 12.9 KB |
| Served HTML | 1584 bytes, empty shell | 15.5 KB of real content |
| Fonts | none loaded (Inter declared, never fetched) | 192 KB, self-hosted, metric-matched |

### Banned patterns

Audited against the built CSS and HTML: zero uppercase transforms, zero tracked-out
letter-spacing, zero middle dots or arrows in copy, zero pills, zero gradients, zero hover
lifts, zero tinted near-blacks, zero filler copy. One `box-shadow` remains and is a 1px inset
rule marking the active Orbital mode, not a card shadow.

### Accessibility

23 interactive elements, all keyboard-reachable, all with a visible focus style. Heading
order `h1 → h2 → h3 → h4 → h3 → h3 → h2 → h3 → h4 → h3 → h3 → h2`: one `h1`, no skipped
levels. The mode switcher operates from the keyboard.

---

## 12. Still in Andres's hands

1. **Flip the primary domain to the apex in Vercel → Settings → Domains.** The canonical,
   the sitemap and the `vercel.json` redirect all point at `andresbotia.com`, but the
   apex → www 308 currently in front of the site is a project-level setting. Until it is
   flipped, the canonical still names a host that redirects away. Verify afterwards with
   `curl -I https://andresbotia.com/` — it should return 200, not 308.

2. **Submit the sitemap in Google Search Console** (`https://andresbotia.com/sitemap.xml`)
   and request indexing for the homepage.

Name-query ranking is also driven by consistent off-site profiles. GitHub, LinkedIn and any
other bio should use the same spelled-out name and link back to the site, because that is
what `sameAs` in the Person markup is there to corroborate.


---

## 13. Post-launch tweaks

### 13.1 Hero line rewritten

> Software engineer, currently working in aviation at Banyan Air.

Replaces the previous line. The `h1` is untouched and still does not animate — it is the LCP
element. The old line survives nowhere; the JSON-LD `description` follows `profile.lead`
automatically.

### 13.2 Decode animation — resolving the conflict with §5

§5 allows **one** orchestrated page-load moment, and the glyph field already had it. Two
options were rejected before building:

- **Sequencing them** (field settles, then text decodes) produces two beats, and moves
  attention right-to-left, against reading order.
- **Two independent effects** is exactly the "competing for attention" the motion budget
  exists to prevent.

**What was built instead: one gesture on two surfaces — the hero resolving from noise into
signal.** The decode's charset *is* the glyph field's own measured ramp (`·:~+xow&@`) plus a
few width-matched additions, so this is the same alphabet appearing in two places rather than
a decode effect bolted onto a canvas fade. Both start at first paint; `--dur-field-in` moves
900ms → 1600ms to share the envelope, and the text locks at 1.9s, so the periphery calms
fractionally before the sentence completes. One arc, one resolution, then stillness apart
from the 90-second rotation.

Locked characters take `--read`; unresolved ones take `--instrument`. Colouring the whole
line while it ran made the finished words snap from accent to grey at the end — a second
moment, which is what this is designed not to be.

**Accessibility.** While running, the visible layer is `aria-hidden` and a visually-hidden
sibling carries the real sentence. `aria-live="off"` was considered and rejected: it
suppresses announcements of *changes*, but a user navigating onto the line mid-animation is
still read whatever the text node currently holds — gibberish. Verified by walking the
subtree the way assistive tech does, skipping `aria-hidden` and `visibility:hidden`; the
exposed string is the correct sentence at every point. Both the extra node and the
`aria-hidden` exist only while running, so the prerendered HTML and the resting DOM are a
single clean `<p>`.

**No layout shift.** Each word renders a `visibility:hidden` ghost of its final text that
sets the box, with the animating characters absolutely positioned and clipped inside it.
Every word occupies exactly its resolved size throughout, so nothing re-wraps — with no
JavaScript measurement. `visibility:hidden` rather than `opacity:0` so the ghost is also out
of the accessibility tree and the sentence is not exposed twice.

~60 lines of vanilla rAF, no library. Runs once per page load; scrolling away and back does
not retrigger. Under `prefers-reduced-motion` the effect never starts.

**The motion list in §5 gains one row and changes one:**

| what | when | why |
|---|---|---|
| hero line decode | load, 1.9s | Shares the field's envelope and its alphabet. One moment, two surfaces. |
| glyph fade-in | load, **1600ms** (was 900ms) | Extended to share that envelope rather than land on its own beat. |

### 13.3 Favicon

`public/favicon.svg` was still the Vite lightning bolt. The mark is now the hero's turbofan
reduced to what survives 16×16 — six swept blades and a lit hub, on true black, in the
field's hue. The hero's fan has sixteen blades, which at 16px is a grey smudge; a favicon
needs its own simplified form, not the drawing scaled down. Blade sweep stays under one
pitch, the same rule the renderer depends on.

`scripts/icons.mjs` generates the set from one source mark: `favicon.svg`, a multi-size
`favicon.ico` (16/32/48), 16×16 and 32×32 PNGs, a 180×180 apple-touch-icon, a 512 icon, and
`site.webmanifest` with `theme_color` and `background_color` matching the existing `#000000`.
Dev-only; never runs on Vercel. Verified by loading the built site in a headed browser and
capturing the OS-level tab strip — the mark renders in the tab.

### 13.4 Hero centring at mobile widths

At 390px the field sat flush left with all 15px of the column's slack on the right.

**The cause was not a leftover margin.** `.hero__field` sets `width:100%` with
`max-width:20rem`, so it cannot fill its grid area — and a grid item that cannot stretch
falls back to `start` alignment. `justify-self:center` is the alignment a constrained box
actually needs; a margin patch would have hidden it at one width and reappeared at another.
Desktop is unchanged and still deliberately asymmetric, with `justify-self:end` stated
explicitly so the auto margin and the alignment property are not silently competing.

| viewport | left gap | right gap |
|---|---|---|
| 320 | 0 | 0 |
| 390 | 8 | 7 |
| 768 | 186 | 185 |
| 1440 | — | bleed, intended |

Also removed `body { min-width: 320px }`, a leftover from the old stylesheet: at a 320px
viewport with a classic 15px scrollbar it forced the body wider than the visible area and
produced genuine horizontal scroll. The layout is fluid below 300px without it.

### 13.5 Two bugs found while verifying

- **Six eslint `no-undef` errors in `scripts/og.mjs`** had been failing since that file was
  added. Its `page.evaluate` callbacks are written in Node but execute in the browser, and
  the script override only declared Node globals. They went unnoticed because lint was being
  piped through `tail`, which replaces the command's exit status with `tail`'s. Exit codes
  are now checked directly.
- **Nine unreferenced PNGs** left behind by the cut project carousels — 3.4 MB still being
  deployed. Deleted.

### 13.6 Re-measured

Lighthouse on the built site, after all of the above:

| | |
|---|---|
| Performance | **97** |
| Accessibility | **100** |
| Best practices | **100** |
| SEO | **100** |

LCP 2.6s · **CLS 0** · TBT 20ms · FCP 1.4s · colour contrast PASS.

Measured directly in a real browser across the whole load including the decode, CLS is
0.00033 — the residue is the last word's box switching from an inline-block ghost back to a
plain text node. Lighthouse reports 0. Both numbers are recorded rather than picking the
flattering one; it is 0.3% of the 0.1 budget either way.


---

## 14. Copy audit

Copy only. No design, layout or animation changed in this pass.

### 14.1 Banyan framing

The old wording made initiative sound like a complaint about the employer. "Work nobody
assigned" implies work was lying around neglected, and "built unprompted" implies nobody
directs anything. The fact worth keeping is self-direction, and it now reads that way.

**Tenure body**

> before: The engineer role added scope and ownership **— including work nobody assigned.**
> after:  The engineer role expanded that into full ownership, **including proposing and building the Executive Dashboard.**

Naming the dashboard here does two jobs at once: it removes the implication, and it ties the
initiative directly to the ownership through-line instead of leaving it as a loose fragment.
"Proposing" carries the initiative without any suggestion that the work was going unclaimed.

**Dashboard body**

> before: **Built unprompted.** It pulls live FlightAware data, cross-references it against reservations and fueling records, and surfaces the financials **—** including flights that never came through.
> after:  **Self-started.** It pulls live FlightAware data, cross-references it against reservations and fueling records, and surfaces the financials**,** including flights that never came through.

Same fact, stated as a strength. Everything after the first sentence is unchanged: FlightAware,
reservations, fueling, financials, the hand reconciliation, daily executive use. Nothing invented.

### 14.2 Em dashes

Five in total across all visible copy. Three changed, one was already being rewritten above,
one kept.

| where | before | after | why |
|---|---|---|---|
| Banyan tenure | `ownership — including…` | rewritten (§14.1) | Dash was carrying an aside that shouldn't have been an aside. |
| Dashboard | `financials — including…` | `financials, including…` | Plain apposition. A comma is what this actually is. |
| Yearly Tracker | `no analytics — everything stays on the device.` | `Everything stays on the device: no account, no sync, no analytics.` | The dash was announcing a summary. Inverting the clause lets a colon do that job properly, and puts the claim before the list. |
| Footer | `Andres Botia — 2026` | `Andres Botia, 2026` | Decorative. A byline separator earns nothing from an em dash. |
| `<title>` | `Andres Botia — Software Engineer` | **kept** | A page title separator is one of the few places an editor genuinely reaches for an em dash. The alternatives are worse: `\|` reads as SEO boilerplate and a middle dot is on the banned list. |

Verified against the built HTML: zero em dashes remain in rendered body text.

### 14.3 Other patterns — checked, nothing to change

- **"X. Not Y. Z."** — grepped for it. Not present anywhere.
- **Stacked compound descriptors.** The three project summaries are noun phrases, which is
  idiomatic for a project tagline and consistent across all three, but none stacks adjectives:
  "Real-time visualisation of…", "An offline-first app for…", "A baseball prediction dashboard
  that…". One modifier each. Left alone; converting all three to full sentences would be a
  voice change, not a copy fix.
- **Filler.** Scanned for seamless, robust, cutting-edge, leverage, passionate, bringing to
  life, crafting, delve, elevate, empower, streamline, holistic, synergy. One hit, in a code
  comment ("highest-leverage change for name queries"), which is not visible copy. Nothing in
  the rendered site.

### 14.4 Dead copy removed

Four fields in `src/data/profile.ts` were rendered nowhere and had survived the rebuild:

- `summary` — "Full-stack engineer with a focus on practical systems across modern interfaces,
  APIs, SQL/data, automation, IBM i/RPG environments, aviation technology, and operational
  software." A seven-item pile-up, and exactly the register this audit exists to remove.
- `facts` — including "Experience direction spans modern and legacy system boundaries", which
  does not mean anything.
- `headline`, `initials` — superseded by `name` and by dropping the old circular brand mark.

Deleting them removes the risk of that wording being reintroduced by being reached for later.

---

## 15. Scroll motion

Two effects, deliberately different in mechanism. §5 caps the page at one orchestrated
*load* moment, which the hero holds; these are scroll-responsive and section-specific. The
rule they respect is the one that matters: **no repeated formula.** Nothing was added to
Yearly Tracker, Grand Slam Insights or Contact, and nothing should be — the point is that
these two are structurally unlike each other, not that every section gets a treatment.

| | Orbital | Experience |
|---|---|---|
| mechanism | `IntersectionObserver`, fires once | CSS scroll-driven timeline, continuous |
| what it does | demonstrates the product's modes | tracks reading position |
| JS | a few timers, then nothing | none |
| animated property | `opacity` | `transform: scaleY` |

Both animate only compositor properties, so **neither can produce layout shift by
construction** — not merely by measurement.

### 15.1 Orbital — mode crossfade

The four captures now stack in a fixed-aspect frame and crossfade, instead of one `<img>`
swapping `src`. On first entry the sequence steps Overview → Aviation → Space → Earth →
Overview at 420ms a step, about 1.9s in total. Measured: `0@4ms → 1@640 → 2@1064 → 3@1475 →
0@1901`.

This is a demonstration, not a reveal. It shows the mode-switching the project actually has,
using the assets the manual control already uses, which is why nothing like it appears on the
other two projects.

- **Fires once.** The observer disconnects on first intersection; scrolling away and back
  leaves it resting on Overview.
- **The user always wins.** A click sets a claimed flag, clears every pending timer and is
  permanent. Verified: clicking Earth mid-sequence holds index 3 through the remaining 1.6s,
  and manual switching works normally afterwards.
- **Slow networks degrade to a shorter sequence, not a broken one.** The order is built from
  captures that have actually decoded; undecoded modes are skipped. If fewer than two are
  ready at intersection, the sequence hands off to the image's `onLoad` rather than blocking
  behind a round trip.
- **Reduced motion** skips the sequence entirely and shows the resting capture. Verified:
  still index 0 after 2.2s.
- Stacking also fixed a pre-existing bug: the old switcher swapped `src`, so each mode
  flashed empty the first time it was chosen.

### 15.2 Experience — timeline progress trace

The section's existing spine inks in as it is read. Not a new element: it sits exactly on the
hairline that already runs down every section, and because Experience is chronological,
filling it encodes progress through the five years.

CSS-only via `animation-timeline: view()`. No scroll listener, no per-frame JavaScript, and
therefore no possibility of interleaved layout reads and writes. Measured over a 120-frame
scroll: median frame gap 6.1ms, p95 6.2ms, max 12.1ms, **zero frames over 32ms, zero long
tasks.**

**The range took two corrections**, both found by measuring rather than by reading the spec:

| range | result |
|---|---|
| `cover` | Topped out at **scaleY 0.852**. It only completes once the section's bottom clears the viewport top, and there is not enough page below Experience to scroll that far, so the trace read as permanently unfinished. |
| `entry 0% entry 100%` | Overcorrected. For a subject taller than the viewport the entry range is clamped, so it filled by the time the section's top reached the viewport top — when reading *starts*. |
| `entry 0% contain 100%` | Correct. Measured 0 → 0.211 → 0.499 → 0.788 → 1.0 across the section, and 1.0 at the bottom of the page. |

**Colour** is `--dim` on a `--rule-soft` track. The first attempt used `--rule`, which sits so
close to `--rule-soft` in value that the filled and unfilled halves were indistinguishable —
a progress trace nobody can read is just a line. `--dim` is the existing small-secondary-text
colour, so it stays quiet while the progression is legible. No new token, no glow, no pulse.

**Fallback and reduced motion are the same thing:** `scaleY(1)`, a complete hairline,
indistinguishable from the spine every other section already has. Browsers without
scroll-driven animations (Safari, Firefox at time of writing) therefore get the page without
the effect rather than a broken one. Verified: `scaleY` stays 1 across scroll positions under
`prefers-reduced-motion`.

**Desktop only, above 900px.** Below that the rail collapses to a horizontal row and the
vertical spine this inhabits does not exist. Inventing structure on mobile to host a
decoration is the opposite of what this design does, so the effect is absent there and the
section renders exactly as before. This is a deliberate deviation from the brief's request
for a mobile screenshot of the trace.

### 15.3 Re-measured

Performance 96, accessibility 100, best practices 100, SEO 100. LCP 2.8s, TBT 0ms.

Lighthouse reports CLS 0.002. Isolated in a real browser with a full scroll pass: 0.00082
with motion, **0.00000 under reduced motion**, and the shifts all fall in the 639–1118ms
window, which is the hero decode's. It is the pre-existing residue recorded in §13.6, not the
new effects — as expected, since opacity and transform cannot shift layout.
