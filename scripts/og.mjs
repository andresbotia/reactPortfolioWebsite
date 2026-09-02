import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

/*
 * Builds the 1200x630 social card.
 *
 * It runs against the built site rather than a standalone template so the card
 * uses the same fonts and the same turbofan the page actually renders — the
 * field is lifted straight off the live hero canvas rather than redrawn from a
 * second copy of the renderer that could drift.
 *
 * Dev-only: this writes public/og.png, which is committed. It is not part of
 * `npm run build` and never runs on Vercel.
 */

const origin = process.argv[2] ?? "http://localhost:4173";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(origin, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2500);

const field = await page.evaluate(() => {
  const c = document.querySelector(".hero__canvas");
  return c ? c.toDataURL("image/png") : null;
});
if (!field) {
  console.error("og: hero canvas not found");
  process.exit(1);
}

await page.setViewportSize({ width: 1200, height: 630 });
await page.evaluate((fieldSrc) => {
  document.documentElement.style.cssText = "margin:0;padding:0";
  document.body.style.cssText =
    "margin:0;padding:0;width:1200px;height:630px;background:#000;overflow:hidden;position:relative";
  document.body.innerHTML = `
    <div style="position:absolute;right:-70px;top:50%;transform:translateY(-50%);width:620px;height:620px">
      <img src="${fieldSrc}" style="width:100%;height:100%;display:block" />
    </div>
    <div style="position:absolute;left:72px;top:50%;transform:translateY(-50%);max-width:600px">
      <div style="font-family:Newsreader,Georgia,serif;font-weight:300;font-variation-settings:'opsz' 72;
                  font-size:92px;line-height:0.92;letter-spacing:-0.03em;color:#F2F0ED">Andres Botia</div>
      <div style="margin-top:26px;font-family:'IBM Plex Mono',monospace;font-size:19px;
                  letter-spacing:0.02em;color:#7FB6FF">Software engineer</div>
      <div style="margin-top:14px;font-family:'IBM Plex Sans',Arial,sans-serif;font-size:21px;
                  line-height:1.5;color:#8C8681;max-width:520px">Modern interfaces on systems that were never meant to have them.</div>
    </div>`;
}, field);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

const png = await page.screenshot({ type: "png" });
writeFileSync("public/og.png", png);
console.log(`og: wrote public/og.png (${(png.length / 1024).toFixed(0)} KB, 1200x630)`);

await browser.close();
