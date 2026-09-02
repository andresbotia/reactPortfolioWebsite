import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

/*
 * Prerender to static HTML with react-dom/server. No headless browser: all of
 * this site's content is static TypeScript in src/data, nothing fetches at
 * build time, and no route depends on runtime state.
 *
 * This runs identically on a laptop and in Vercel's build image, needs no
 * browser download or system libraries, and adds about two seconds.
 */

const dist = "dist";
const template = readFileSync(join(dist, "index.html"), "utf8");

const { render } = await import(
  pathToFileURL(join(process.cwd(), "dist-ssr", "entry-server.js")).href
);

const { routes, html, personJsonLd, projectsJsonLd, sitemap, robots } = render();

const ORIGIN = personJsonLd.url.replace(/\/$/, "");
const escape = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* One JSON-LD graph rather than several script tags: fewer nodes for a crawler
   to reconcile, and the Person is unambiguously the root entity. */
const stripContext = (node) => {
  const copy = { ...node };
  delete copy["@context"];
  return copy;
};

const graph = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [personJsonLd, ...projectsJsonLd].map(stripContext),
});

function head(route) {
  const url = `${ORIGIN}${route.path}`;
  const image = `${ORIGIN}/og.png`;
  return [
    `<meta name="description" content="${escape(route.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:site_name" content="Andres Botia" />`,
    `<meta property="og:title" content="${escape(route.title)}" />`,
    `<meta property="og:description" content="${escape(route.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Andres Botia, software engineer" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(route.title)}" />`,
    `<meta name="twitter:description" content="${escape(route.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<script type="application/ld+json">${graph}</script>`,
  ].join("\n    ");
}

const written = [];

for (const route of routes) {
  const page = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(route.title)}</title>`)
    .replace("<!--seo-->", head(route))
    .replace("<!--app-->", html);

  const out =
    route.path === "/"
      ? join(dist, "index.html")
      : join(dist, route.path.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page);
  written.push({ path: route.path, out, bytes: Buffer.byteLength(page) });
}

writeFileSync(join(dist, "sitemap.xml"), sitemap);
writeFileSync(join(dist, "robots.txt"), robots);

/*
 * Fail loudly. A prerender that silently produces an empty shell is worse than
 * one that does not run, because the deploy still succeeds and the regression
 * is invisible until someone checks the served HTML months later.
 */
const MIN_BYTES = 12000;
let failed = false;
for (const page of written) {
  const body = readFileSync(page.out, "utf8");
  const problems = [];
  if (!body.includes("Andres Botia")) problems.push("name missing from HTML");
  if (!body.includes("Banyan Air Service")) problems.push("experience missing from HTML");
  if (!body.includes("Orbital")) problems.push("project copy missing from HTML");
  if (page.bytes < MIN_BYTES) problems.push(`only ${page.bytes} bytes, expected >= ${MIN_BYTES}`);
  if (problems.length) {
    failed = true;
    console.error(`prerender FAILED ${page.path}: ${problems.join("; ")}`);
  } else {
    console.log(`prerendered ${page.path} → ${(page.bytes / 1024).toFixed(1)} KB`);
  }
}
console.log(`wrote sitemap.xml and robots.txt for ${routes.length} route(s)`);
if (failed) process.exit(1);
