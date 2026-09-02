import { renderToString } from "react-dom/server";
import App from "./App";
import { personJsonLd, projectsJsonLd, robotsTxt, routes, sitemapXml } from "./site";

/*
 * The SSR entry. No browser is involved in prerendering this site: every piece
 * of content lives in src/data as static TypeScript, nothing fetches at build
 * time, and no route depends on runtime state — so renderToString is the whole
 * job. That avoids downloading a headless browser into the Vercel build, which
 * has no cache for it and no root to install system libraries with.
 */
export function render() {
  return {
    routes,
    html: renderToString(<App />),
    personJsonLd: personJsonLd(),
    projectsJsonLd: projectsJsonLd(),
    sitemap: sitemapXml(),
    robots: robotsTxt(),
  };
}
