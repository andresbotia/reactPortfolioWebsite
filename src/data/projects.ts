export type ProjectLink = {
  label: string;
  href: string;
};

export type ProjectShot = {
  /* The app's own mode names, so the control describes the product rather than
     inventing categories for it. */
  mode: string;
  src: string;
  alt: string;
};

export type Project = {
  name: string;
  year: string;
  status: string;
  summary: string;
  stack: string[];
  links: ProjectLink[];
  /* Present only on the lead case study. */
  body?: string[];
  engineering?: string[];
  shots?: ProjectShot[];
};

/*
 * Orbital leads as a case study; the rest are a short list. Two earlier entries
 * — a 2020 static photography site and a Chrome extension that replaced one
 * button — were cut, because three strong entries read better than five uneven
 * ones.
 */
export const lead: Project = {
  name: "Orbital",
  year: "2026",
  status: "Live",
  summary:
    "Real-time visualisation of activity across Earth and near-Earth space.",
  body: [
    "A dark interactive globe sits at the centre, surrounded by sparse HUD telemetry built from live public data: aircraft positions, the ISS, earthquakes, storms, wildfires, volcanoes, space weather, and the satellite catalogue.",
    "Four modes. Overview composes everything at once; Aviation, Space and Earth each narrow the field to one domain.",
  ],
  engineering: [
    "One instanced draw call per category, rather than a mesh per object.",
    "Screen-space decluttering, so dense aircraft fields stay readable.",
    "SGP4 satellite propagation from CelesTrak TLEs, run locally on a throttled frame budget.",
    "Natural Earth geometry loaded only near regional zoom, with a distance-based crossfade between detail levels.",
    "Provider responses isolated behind adapters, so components only ever see normalised domain models.",
    "Live status derived from real fetch timestamps, so a partly degraded feed never discards last-good data.",
  ],
  stack: [
    "React",
    "TypeScript",
    "Vite",
    "Three.js",
    "React Three Fiber",
    "Zustand",
    "TanStack Query",
    "Vitest",
  ],
  shots: [
    {
      mode: "Overview",
      src: "/orbital/overview.webp",
      alt: "Orbital by Andres Botia, Overview mode: a dark 3D globe showing live aircraft, storm, wildfire and earthquake markers over the Americas, with live counts and an event stream around it.",
    },
    {
      mode: "Aviation",
      src: "/orbital/aviation.webp",
      alt: "Orbital by Andres Botia, Aviation mode: live aircraft positions from the ADS-B network plotted across the globe with flight telemetry panels.",
    },
    {
      mode: "Space",
      src: "/orbital/space.webp",
      alt: "Orbital by Andres Botia, Space mode: tracked satellites propagated from CelesTrak orbital elements, with the ISS and its orbit highlighted.",
    },
    {
      mode: "Earth",
      src: "/orbital/earth.webp",
      alt: "Orbital by Andres Botia, Earth mode: weather, seismic and wildfire activity layered over the globe with regional coastline detail.",
    },
  ],
  links: [
    { label: "Live site", href: "https://orbital-seven-azure.vercel.app" },
    { label: "Source", href: "https://github.com/andresbotia/Orbital" },
  ],
};

export const projects: Project[] = [
  {
    name: "Yearly Tracker",
    year: "2026",
    status: "iOS and Android",
    summary:
      "An offline-first app for yearly goals and daily habits. Everything stays on the device: no account, no sync, no analytics.",
    stack: ["React Native", "Expo", "TypeScript"],
    links: [
      {
        label: "App Store",
        href: "https://apps.apple.com/us/app/yearly-tracker/id6757343606",
      },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.andresbotia.yearlytracker&hl=en_US",
      },
      { label: "Source", href: "https://github.com/andresbotia/yearly-tracker" },
    ],
  },
  {
    name: "Grand Slam Insights",
    year: "2025",
    status: "Live",
    summary:
      "A baseball prediction dashboard that shows its own calibration. Model output sits next to book odds and backtests, so a pick can be checked rather than taken on trust.",
    stack: ["React", "Express", "Supabase"],
    links: [
      {
        label: "Live site",
        href: "https://grand-slam-insights-client.vercel.app/",
      },
      { label: "Source", href: "https://github.com/andresbotia/grandSlamBetting" },
    ],
  },
];
