/*
 * The hero's glyph field: a turbofan seen head-on, rendered as glowing
 * monospace glyphs. See PLAN.md §7.1.
 *
 * Why a turbofan and not a globe: Orbital is the lead case study and Orbital is
 * a globe, so a globe here would open the page with a duplicate of its own best
 * content. A fan is also radially symmetric, which is what lets it stay
 * legible at 390px, and rotation about the view axis is the one motion that
 * stays clean in a glyph grid — cells never shear, so nothing crawls.
 *
 * No DOM nodes: one canvas, one sprite atlas, drawImage per cell.
 */

const TAU = Math.PI * 2;

/*
 * Ramp measured, not assumed: each candidate was rasterised in IBM Plex Mono at
 * the real cell size and its mean ink coverage computed. These ten are the
 * evenest run available (step deltas 0.043-0.071) among glyphs that are
 * vertically centred and roughly symmetric, so the dim end of the falloff reads
 * as texture rather than as jitter.
 *
 *   " " .000   "·" .044   ":" .087   "~" .158   "+" .218
 *   "x" .273   "o" .323   "w" .383   "&" .434   "@" .492
 *
 * No glyph exceeds ~0.49 coverage, which is why brightness is carried mostly by
 * colour: the ramp supplies texture, the colour ramp supplies luminance.
 */
const RAMP = " ·:~+xow&@";

/* Brightness levels in the atlas. 16 is past the point where banding is
   visible once the luminance is dithered before quantising. */
const LEVELS = 16;

/* One hue. Brightness carries the form, blooming to near-white at the core. */
const HUE = { r: 127, g: 182, b: 255 };

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/*
 * Interleaved gradient noise. Spectrally close enough to blue noise for this,
 * and it costs two multiplies instead of a lookup table. Offsetting luminance
 * by +/- half a quantisation step before picking a level is what removes both
 * the banding and the flat plateau at the core.
 */
function ign(x: number, y: number) {
  const v = 52.9829189 * ((0.06711056 * x + 0.00583715 * y) % 1);
  return v - Math.floor(v);
}

/*
 * Emission at a point on the fan face. Coordinates are normalised so that
 * r = 1 is the nacelle lip; the caller handles cell aspect, so this stays
 * circular regardless of the grid's cell shape.
 */
const BLADES = 16;
const PITCH = TAU / BLADES;

/*
 * Almost everything in the fan depends only on radius, and radius is the
 * expensive part: exp, pow and log per cell across several thousand cells was
 * costing 15.5ms a frame, which is half the budget spent before a single glyph
 * is blitted. Those terms are baked into radial tables once per layout, and the
 * per-cell work reduces to a sqrt, an atan2 and two lookups.
 */
const RSTEPS = 512;
const RMAX = 1.4;
const USTEPS = 256;

type Tables = {
  /* cone envelope, before the swirl is carved out of it */
  cone: Float32Array;
  /* the swirl's log-spiral term, which is a function of radius alone */
  spiralLog: Float32Array;
  /* blade sweep at this radius */
  sweep: Float32Array;
  /* annulus mask times the radial brightness envelope */
  annRad: Float32Array;
  /* nacelle lip plus the outer halo */
  lipHalo: Float32Array;
  /* blade chord profile across one pitch, times its leading-edge shading */
  blade: Float32Array;
};

function buildTables(): Tables {
  const cone = new Float32Array(RSTEPS);
  const spiralLog = new Float32Array(RSTEPS);
  const sweep = new Float32Array(RSTEPS);
  const annRad = new Float32Array(RSTEPS);
  const lipHalo = new Float32Array(RSTEPS);

  for (let i = 0; i < RSTEPS; i++) {
    const r = (i / (RSTEPS - 1)) * RMAX;

    /*
     * The spinner. Deliberately large relative to the disc: a mono grid gives
     * the hub only a handful of cell rows, so a physically accurate small nose
     * cone has no resolution to be read with.
     */
    cone[i] = smoothstep(0.24, 0.15, r) * 0.85;
    spiralLog[i] = r > 0.02 ? Math.log(r / 0.02) * 2.3 : 0;

    const t = clamp((r - 0.22) / 0.62, 0, 1);
    sweep[i] = PITCH * 0.8 * t ** 1.2;

    const annulus = smoothstep(0.2, 0.28, r) * (1 - smoothstep(0.82, 0.9, r));
    /* Brightest across the inner disc, so the eye reads a lit object rather
       than an evenly filled ring. */
    const radial = 0.62 + 0.38 * Math.exp(-(((r - 0.34) / 0.46) ** 2));
    annRad[i] = annulus * radial * 1.12;

    const lip = Math.exp(-(((r - 0.94) / 0.032) ** 2)) * 0.55;
    /* A halo outside the lip so the field decays smoothly into black instead of
       stopping at a hard circle. */
    const halo = Math.exp(-(((r - 0.94) / 0.19) ** 2)) * 0.09;
    lipHalo[i] = lip + halo + Math.exp(-((r / 0.1) ** 2)) * 0.5;
  }

  /*
   * Blade cross-section across one pitch. A duty cycle, not a cosine power: a
   * cosine gives thin bright spokes and reads as a starburst, whereas a real fan
   * is mostly blade with a narrow dark gap, shading from a bright leading edge
   * to a dark trailing one — which is what makes the disc look turned rather
   * than drawn.
   */
  const blade = new Float32Array(USTEPS);
  const DUTY = 0.74;
  for (let i = 0; i < USTEPS; i++) {
    const u = i / USTEPS;
    const chord = smoothstep(0, 0.05, u) * (1 - smoothstep(DUTY - 0.09, DUTY, u));
    const shade = 0.4 + 0.6 * (1 - clamp(u / DUTY, 0, 1)) ** 0.8;
    blade[i] = chord * shade;
  }

  return { cone, spiralLog, sweep, annRad, lipHalo, blade };
}

export type GlyphField = {
  start: () => void;
  stop: () => void;
  renderOnce: () => void;
  destroy: () => void;
  /* Last frame's cost and cell counts. Kept in the shipped build because the
     frame budget is a stated requirement and this is how it gets verified. */
  stats: () => { ms: number; cells: number; hot: number };
};

type Sprites = {
  atlas: HTMLCanvasElement;
  bloom: HTMLCanvasElement;
  cw: number;
  ch: number;
  bloomSize: number;
};

function buildSprites(cw: number, ch: number, fontPx: number, dpr: number): Sprites {
  const atlas = document.createElement("canvas");
  atlas.width = Math.ceil(cw * RAMP.length);
  atlas.height = Math.ceil(ch * LEVELS);
  const g = atlas.getContext("2d");
  if (g) {
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `400 ${fontPx}px "IBM Plex Mono", ui-monospace, monospace`;
    for (let l = 0; l < LEVELS; l++) {
      const tv = l / (LEVELS - 1);
      /* Blooms toward white at the top of the range without ever leaving the
         hue: one colour, brightness doing the work. */
      const w = tv ** 3;
      const r = Math.round(HUE.r * tv + (255 - HUE.r) * w);
      const gg = Math.round(HUE.g * tv + (255 - HUE.g) * w);
      const b = Math.round(HUE.b * tv + (255 - HUE.b) * w);
      g.fillStyle = `rgb(${r},${gg},${b})`;
      for (let i = 0; i < RAMP.length; i++) {
        g.fillText(RAMP[i], i * cw + cw / 2, l * ch + ch / 2 + fontPx * 0.06);
      }
    }
  }

  /* A pre-rendered halo, drawn additively under the hottest cells. Cheaper and
     smoother than re-stamping glyphs, and it is what stops the core reading as
     a flat plateau of identical bright characters. */
  const bloomSize = Math.max(6, Math.round(ch * 2.4));
  const bloom = document.createElement("canvas");
  bloom.width = bloomSize;
  bloom.height = bloomSize;
  const bg = bloom.getContext("2d");
  if (bg) {
    const c = bloomSize / 2;
    const grad = bg.createRadialGradient(c, c, 0, c, c, c);
    grad.addColorStop(0, `rgba(${HUE.r},${HUE.g},${HUE.b},0.55)`);
    grad.addColorStop(0.4, `rgba(${HUE.r},${HUE.g},${HUE.b},0.16)`);
    grad.addColorStop(1, `rgba(${HUE.r},${HUE.g},${HUE.b},0)`);
    bg.fillStyle = grad;
    bg.fillRect(0, 0, bloomSize, bloomSize);
  }

  void dpr;
  return { atlas, bloom, cw, ch, bloomSize };
}

export function createGlyphField(canvas: HTMLCanvasElement): GlyphField | null {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return null;
  /* Bound to a non-nullable local so the closures below do not each have to
     re-prove it. */
  const ctx: CanvasRenderingContext2D = context;

  let raf = 0;
  let running = false;
  let theta = 0;
  let lastTime = 0;
  let sprites: Sprites | null = null;
  const tables = buildTables();
  let cols = 0;
  let rows = 0;
  let cw = 0;
  let ch = 0;
  let dpr = 1;

  /* One rotation every 90 seconds. Slow enough that 30fps is indistinguishable
     from 60 — the per-frame angular step is 0.0023 rad — so the frame budget is
     halved for nothing visible. */
  const RADS_PER_MS = TAU / 90000;
  const FRAME_MS = 1000 / 30;

  /*
   * Adaptive density. The frame cost is dominated by fill rate, which varies by
   * an order of magnitude across the GPUs this will actually run on: the same
   * field measured 3.8ms on a discrete card and would not hold 30fps on a weak
   * integrated one. Rather than pick a cell size for the worst machine and make
   * everyone else look at it, the first second of real frames is measured and
   * the grid coarsens a step at a time until the budget is met.
   */
  let quality = 0;
  const MAX_QUALITY_STEPS = 2;
  /* A third of the 33ms budget, leaving room for compositing and anything else
     sharing the main thread. */
  const BUDGET_MS = 11;
  let probe: number[] | null = [];

  function layout() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return false;

    /* Branch on the viewport, not on the canvas box: the field is only ~480px
       wide even on a 1440 desktop, so testing rect.width silently put desktop
       on the mobile budget. */
    const narrow = window.innerWidth < 900;

    /* Capped device pixel ratio: past 2 the glyphs are finer than the eye
       resolves and the fill cost is real. Narrow screens are capped harder. */
    dpr = Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 2);

    /* Cell size is the frame-budget lever, and quality is bought back on
       hardware that can afford it: coarsen() raises this step when measured
       frame cost says the machine cannot hold the budget. */
    const fontPx = (narrow ? 8 : 10.5) + quality * 2;
    cw = fontPx * 0.6; /* IBM Plex Mono advance is 600/1000 em */
    /* Line height is set from the glyphs, not from the font size. Every mark in
       the ramp sits within cap height — none has an ascender or a descender — so
       a tighter cell clips nothing and buys roughly 28% more rows, which is
       where the vertical resolution of a radial subject is won. */
    ch = fontPx * 0.78;

    cols = Math.max(1, Math.floor(rect.width / cw));
    rows = Math.max(1, Math.floor(rect.height / ch));

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    sprites = buildSprites(
      Math.ceil(cw * dpr),
      Math.ceil(ch * dpr),
      fontPx * dpr,
      dpr
    );
    return true;
  }

  let lastMs = 0;
  let lastCells = 0;
  let lastHot = 0;

  function draw() {
    if (!sprites) return;
    const t0 = performance.now();
    let drawn = 0;
    const { atlas, bloom, cw: scw, ch: sch, bloomSize } = sprites;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;
    const radius = (Math.min(W, H) / 2) * 0.94;

    const stepCw = cw * dpr;
    const stepCh = ch * dpr;
    const half = 0.5 / (LEVELS - 1);

    /* Hot cells are collected and drawn additively afterwards so the composite
       mode is switched twice per frame rather than per cell. */
    const hotX: number[] = [];
    const hotY: number[] = [];
    const hotA: number[] = [];

    ctx.globalCompositeOperation = "source-over";

    const { cone, spiralLog, sweep, annRad, lipHalo, blade } = tables;
    const rScale = (RSTEPS - 1) / RMAX;

    for (let row = 0; row < rows; row++) {
      const py = (row + 0.5) * stepCh;
      const ny = (py - cy) / radius;
      const ny2 = ny * ny;
      for (let col = 0; col < cols; col++) {
        const px = (col + 0.5) * stepCw;
        const nx = (px - cx) / radius;

        /* Squared radius first: the majority of cells sit outside the disc and
           are rejected before a sqrt is ever taken. */
        const r2 = nx * nx + ny2;
        if (r2 > RMAX * RMAX) continue;
        const r = Math.sqrt(r2);
        const ri = (r * rScale) | 0;

        let v = lipHalo[ri];

        const ar = annRad[ri];
        if (ar > 0) {
          const a = Math.atan2(ny, nx) + sweep[ri] - theta;
          let u = (a / PITCH) % 1;
          if (u < 0) u += 1;
          v += blade[(u * USTEPS) | 0] * ar;
        }

        const c = cone[ri];
        if (c > 0) {
          const d0 = Math.atan2(ny, nx) + theta * 1.4 + spiralLog[ri];
          const d = Math.abs((((d0 % TAU) + TAU + Math.PI) % TAU) - Math.PI);
          /* Carved out of the cone rather than added on top, so the swirl reads
             as a marking on a solid object, not a second glowing thing. */
          v += c * (1 - Math.exp(-((d / 0.62) ** 2)) * 0.8);
        }

        if (v <= 0.05) continue;
        /* Gamma lifts the mid range so the blade faces carry real weight instead
           of sitting at the bottom of the ramp. */
        v = clamp(v, 0, 1) ** 0.78;

        /* Dither before quantising: this is what removes the banding in the
           falloff and the flat plateau at the core, in one move. */
        const dithered = v + (ign(col, row) - 0.5) * 2 * half;
        const level = Math.round(clamp(dithered, 0, 1) * (LEVELS - 1));
        if (level <= 0) continue;

        const gi = Math.round((level / (LEVELS - 1)) * (RAMP.length - 1));
        if (gi <= 0) continue;

        drawn++;
        ctx.drawImage(
          atlas,
          gi * scw,
          level * sch,
          scw,
          sch,
          Math.round(col * stepCw),
          Math.round(row * stepCh),
          scw,
          sch
        );

        /* Only the genuine core blooms. At a lower threshold most of the blade
           face qualifies and the additive pass dominates the frame: at 0.7 this
           cost ~117ms/frame, at 0.9 it is a rounding error. */
        if (v > 0.9) {
          hotX.push(px);
          hotY.push(py);
          hotA.push(Math.min(1, (v - 0.9) / 0.1) * 0.55);
        }
      }
    }

    if (hotX.length) {
      ctx.globalCompositeOperation = "lighter";
      const hb = bloomSize / 2;
      for (let i = 0; i < hotX.length; i++) {
        ctx.globalAlpha = hotA[i];
        ctx.drawImage(bloom, hotX[i] - hb, hotY[i] - hb, bloomSize, bloomSize);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    lastCells = drawn;
    lastHot = hotX.length;
    lastMs = performance.now() - t0;
  }

  function frame(now: number) {
    if (!running) return;
    if (now - lastTime >= FRAME_MS) {
      theta += (now - lastTime) * RADS_PER_MS;
      lastTime = now;
      draw();

      if (probe) {
        probe.push(lastMs);
        /* Ignore the first few frames: they include the atlas upload and the
           first paint, which are not representative. */
        if (probe.length === 24) {
          const sample = probe.slice(8).sort((a, b) => a - b);
          const median = sample[sample.length >> 1];
          if (median > BUDGET_MS && quality < MAX_QUALITY_STEPS) {
            quality += 1;
            probe = [];
            if (layout()) draw();
          } else {
            probe = null;
          }
        }
      }
    }
    raf = window.requestAnimationFrame(frame);
  }

  function renderOnce() {
    if (!sprites && !layout()) return;
    draw();
  }

  function start() {
    if (running) return;
    if (!sprites && !layout()) return;
    running = true;
    lastTime = performance.now();
    raf = window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  }

  let resizeTimer = 0;
  const observer =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          window.clearTimeout(resizeTimer);
          resizeTimer = window.setTimeout(() => {
            if (layout()) draw();
          }, 120);
        })
      : null;
  observer?.observe(canvas);

  function destroy() {
    stop();
    window.clearTimeout(resizeTimer);
    observer?.disconnect();
    sprites = null;
  }

  return {
    start,
    stop,
    renderOnce,
    destroy,
    stats: () => ({ ms: lastMs, cells: lastCells, hot: lastHot }),
  };
}
