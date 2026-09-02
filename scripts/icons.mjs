import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

/*
 * Generates the favicon set from one source mark.
 *
 * The mark is the hero's turbofan reduced to what survives 16x16: six swept
 * blades and a lit hub. The hero's own fan has sixteen blades, which at 16px
 * is a grey smudge — a favicon needs its own simplified form, not the full
 * drawing scaled down. The sweep runs the same direction as the hero's so the
 * two read as the same object.
 *
 * Dev-only. Writes into public/ and is committed; never runs on Vercel.
 */

const HUE = "#7FB6FF";
const CORE = "#EAF2FF";
const GROUND = "#000000";

/* Six blades at 60 degrees, each swept about a third of its own pitch — the
   same "sweep under one blade pitch" rule the hero renderer depends on to stay
   legible rather than interfering into noise. */
function mark(size = 32) {
  const c = size / 2;
  const inner = size * 0.16;
  const outer = size * 0.42;
  const sweep = 0.38;
  const blades = [];
  for (let i = 0; i < 6; i++) {
    const a0 = (i / 6) * Math.PI * 2;
    const a1 = a0 + sweep;
    const am = (a0 + a1) / 2;
    const rm = (inner + outer) / 2;
    const x0 = c + Math.cos(a0) * inner;
    const y0 = c + Math.sin(a0) * inner;
    const x1 = c + Math.cos(a1) * outer;
    const y1 = c + Math.sin(a1) * outer;
    /* Control point pulled off the chord so the blade curves rather than
       reading as a straight spoke. */
    const cx = c + Math.cos(am - sweep * 0.45) * rm * 1.06;
    const cy = c + Math.sin(am - sweep * 0.45) * rm * 1.06;
    blades.push(
      `<path d="M${x0.toFixed(2)} ${y0.toFixed(2)} Q${cx.toFixed(2)} ${cy.toFixed(
        2
      )} ${x1.toFixed(2)} ${y1.toFixed(2)}"/>`
    );
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${GROUND}"/>
  <g stroke="${HUE}" stroke-width="${(size * 0.085).toFixed(2)}" stroke-linecap="round" fill="none">
    ${blades.join("\n    ")}
  </g>
  <circle cx="${c}" cy="${c}" r="${(size * 0.115).toFixed(2)}" fill="${CORE}"/>
</svg>`;
}

const svg = mark(32);
writeFileSync("public/favicon.svg", svg + "\n");

const browser = await chromium.launch();
const page = await browser.newPage();

async function raster(px) {
  await page.setViewportSize({ width: px, height: px });
  await page.setContent(
    `<html><body style="margin:0;background:${GROUND}">${mark(px)}</body></html>`
  );
  return page.screenshot({ type: "png", omitBackground: false });
}

const sizes = { 16: null, 32: null, 48: null, 180: null, 512: null };
for (const px of Object.keys(sizes)) sizes[px] = await raster(Number(px));

writeFileSync("public/favicon-16x16.png", sizes[16]);
writeFileSync("public/favicon-32x32.png", sizes[32]);
writeFileSync("public/apple-touch-icon.png", sizes[180]);
writeFileSync("public/icon-512.png", sizes[512]);

/*
 * Minimal multi-size .ico. The format is a 6-byte header, one 16-byte directory
 * entry per image, then the image payloads — and PNG payloads are legal inside
 * an ICO, which avoids hand-rolling a BMP encoder for three small squares.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const { px, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(px >= 256 ? 0 : px, 0);
    e.writeUInt8(px >= 256 ? 0 : px, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

writeFileSync(
  "public/favicon.ico",
  ico([
    { px: 16, data: sizes[16] },
    { px: 32, data: sizes[32] },
    { px: 48, data: sizes[48] },
  ])
);

writeFileSync(
  "public/site.webmanifest",
  JSON.stringify(
    {
      name: "Andres Botia",
      short_name: "Andres Botia",
      icons: [
        { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: GROUND,
      background_color: GROUND,
      display: "browser",
      start_url: "/",
    },
    null,
    2
  ) + "\n"
);

await browser.close();
console.log("icons: favicon.svg, .ico (16/32/48), 16x16, 32x32, apple-touch-icon, icon-512, site.webmanifest");
