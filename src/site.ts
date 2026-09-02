import { lead, projects } from "./data/projects";
import { profile } from "./data/profile";

/*
 * The single source of truth for the site's identity and its routes.
 *
 * The route list here is what the prerender writes AND what generates
 * sitemap.xml, so a route cannot end up listed in the sitemap without having
 * been prerendered. That is a structural guarantee rather than a matter of
 * remembering to update two files.
 */

/*
 * Apex is authoritative. Note that the apex -> www 308 currently in front of
 * this site is configured in the Vercel project's Domains settings, not here:
 * the redirect in vercel.json is the second half of the fix, and the primary
 * domain has to be flipped in the dashboard for it to take effect.
 */
export const ORIGIN = "https://andresbotia.com";

export type Route = {
  path: string;
  title: string;
  description: string;
};

export const routes: Route[] = [
  {
    path: "/",
    /* Leads with the spaced form, which is the name query worth ranking for. */
    title: "Andres Botia — Software Engineer",
    description:
      "Andres Botia is a software engineer in Fort Lauderdale, Florida, working on aviation systems: backend business systems in RPG ILE IV on IBM i, and the React and React Native interfaces on top of them.",
  },
];

/*
 * Person markup is the highest-leverage change for name queries: it is what
 * tells Google that "andresbotia", "Andres Botia" and "Andrés Botía" are one
 * entity, and sameAs is what ties this page to the profiles that already rank.
 */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: ["Andrés Botía", "andresbotia", "Andres Felipe Botia"],
    jobTitle: profile.role,
    url: `${ORIGIN}/`,
    email: `mailto:${profile.email}`,
    description: profile.lead,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Deerfield Beach",
      addressRegion: "FL",
      addressCountry: "US",
    },
    worksFor: { "@type": "Organization", name: "Banyan Air Service" },
    knowsAbout: [
      "IBM i",
      "RPG ILE",
      "React",
      "React Native",
      "TypeScript",
      "Aviation software",
      "Legacy system integration",
    ],
    sameAs: profile.socials.map((s) => s.href),
  };
}

export function projectsJsonLd() {
  const all = [lead, ...projects];
  return all.map((project) => {
    const live = project.links.find(
      (l) => l.label === "Live site" || l.label === "App Store"
    );
    const source = project.links.find((l) => l.label === "Source");
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: project.name,
      description: project.summary,
      applicationCategory: "WebApplication",
      operatingSystem: "Web",
      url: live?.href ?? source?.href,
      ...(source ? { codeRepository: source.href } : {}),
      author: { "@type": "Person", name: profile.name, url: `${ORIGIN}/` },
      /* Every project here is free to use and has no price. Stating that
         explicitly is what keeps the markup valid rather than incomplete. */
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    };
  });
}

export function sitemapXml() {
  const urls = routes
    .map(
      (route) =>
        `  <url>\n    <loc>${ORIGIN}${route.path}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`;
}
