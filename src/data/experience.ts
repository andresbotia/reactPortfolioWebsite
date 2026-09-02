/*
 * Every factual claim here is traceable to Andres's own LinkedIn text or to his
 * own account of the Executive Dashboard. Nothing is inferred, embellished, or
 * padded with a metric. Dates and titles are exact.
 *
 * Two editorial decisions, both recorded in PLAN.md §8:
 *
 *   The Cendyn internship carries a title and dates only. It ran eight months
 *   and converted into the associate role, so the progression is the fact worth
 *   showing; an invented paragraph would be worse than a clean line.
 *
 *   The two Banyan roles describe near-identical work, so they are one tenure
 *   with two titles. The honest difference is not wording — it is that the
 *   Executive Dashboard was self-initiated, and taking on unprompted work that
 *   reached production is what separates the engineer role from the apprentice
 *   one. The progression is shown by a fact rather than by rewriting the same
 *   paragraph twice.
 */

declare const __BUILD_MONTH__: string;

/* Fixed at build time — see vite.config.ts. */
export const BUILD_MONTH = __BUILD_MONTH__;

export type Role = {
  title: string;
  /* YYYY-MM, or null for the current role. Used for <time> and the axis. */
  start: string;
  end: string | null;
};

export type Tenure = {
  company: string;
  location: string;
  start: string;
  end: string | null;
  roles: Role[];
  body: string;
  highlight?: { name: string; body: string };
  stack: string[];
};

export const tenures: Tenure[] = [
  {
    company: "Banyan Air Service",
    location: "Fort Lauderdale, Florida",
    start: "2024-02",
    end: null,
    roles: [
      { title: "Software Engineer", start: "2025-02", end: null },
      { title: "Software Developer Apprentice", start: "2024-02", end: "2025-02" },
    ],
    body: "Backend business systems in RPG ILE IV on IBM i, and the React and React Native tools that sit on top of them. The apprenticeship covered that ground under direction. The engineer role added scope and ownership — including work nobody assigned.",
    highlight: {
      name: "Banyan Executive Dashboard",
      body: "Built unprompted. It pulls live FlightAware data, cross-references it against reservations and fueling records, and surfaces the financials — including flights that never came through. That reconciliation used to be done by hand. The executive team uses it daily.",
    },
    stack: ["RPG ILE IV", "IBM i", "DB2", "React", "React Native", "Expo"],
  },
  {
    company: "Cendyn",
    location: "Boca Raton, Florida",
    start: "2021-10",
    end: "2023-12",
    roles: [
      { title: "Associate Software Engineer", start: "2022-05", end: "2023-12" },
      { title: "System Analyst Intern", start: "2021-10", end: "2022-05" },
    ],
    body: "Designing, building and maintaining applications on .NET, writing and debugging under a mentor, and testing at unit, integration and system level. Started as a systems analyst intern and converted to the engineering role after eight months.",
    stack: ["C#", ".NET Framework"],
  },
  {
    company: "Foot Locker",
    location: "United States",
    start: "2021-05",
    end: "2021-07",
    roles: [{ title: "Core Retail Internship", start: "2021-05", end: "2021-07" }],
    body: "CI/CD, instrumentation and monitoring on key internal systems, and automation across retail site operations.",
    stack: ["CI/CD", "Instrumentation", "Monitoring"],
  },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatMonth(value: string) {
  const [year, month] = value.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

function toMonths(value: string) {
  const [year, month] = value.split("-").map(Number);
  return year * 12 + (month - 1);
}

/*
 * Length in months. This drives the duration bar in the rail, which is the
 * whole point of the section: the reader should see the shape of five years
 * before reading a word of it.
 *
 * `now` is passed in rather than read from the clock, so the render is
 * deterministic and the prerendered HTML matches what the client produces.
 */
export function span(tenure: Tenure, now: string) {
  /* Inclusive of both end months: May-Jul 2021 is three months, not two. */
  return toMonths(tenure.end ?? now) - toMonths(tenure.start) + 1;
}

export function longestSpan(now: string) {
  return Math.max(...tenures.map((t) => span(t, now)));
}
