export type Project = {
  name: string;
  date?: string;
  label: string;
  description: string;
  createdFor?: string;
  problem?: string;
  system?: string;
  engineering?: string[];
  result?: string;
  technologies: string[];
  href?: string;
  links?: {
    label: string;
    href: string;
  }[];
};

export const projects: Project[] = [
  {
    name: "Yearly Tracker",
    date: "Jan 24, 2026",
    label: "Published Mobile App",
    description:
      "An offline-first mobile app for setting yearly goals, tracking habits, and measuring progress across the year.",
    createdFor:
      "Published personal product for iOS and Android, with public source available on GitHub.",
    problem:
      "Yearly goals and daily habits often end up split across notes, spreadsheets, and apps that add account, sync, or analytics overhead.",
    system:
      "Expo and React Native app with yearly goals, habit tracking, dashboard summaries, widgets, local device storage, and customizable color themes.",
    engineering: [
      "Expo",
      "React Native",
      "AsyncStorage",
      "iOS",
      "Android",
      "Kotlin",
      "Swift",
    ],
    result:
      "Shipped as a privacy-first app with no accounts, ads, analytics, tracking, subscriptions, or cloud syncing.",
    technologies: ["Expo", "React Native", "JavaScript", "iOS", "Android"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/andresbotia/yearly-tracker",
      },
      {
        label: "App Store",
        href: "https://apps.apple.com/us/app/yearly-tracker/id6757343606",
      },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.andresbotia.yearlytracker&hl=en_US",
      },
    ],
  },
  {
    name: "Twitter Revenue Chrome Extension",
    date: "Dec 14, 2023",
    label: "Browser Extension",
    description:
      "A Chrome extension that modifies Twitter/X tweet UI to show estimated revenue for individual tweets.",
    createdFor:
      "Personal project to learn and experiment with Chrome extension development.",
    problem:
      "The native interface surfaces impressions, but not an estimate of what an individual post could represent in ad revenue.",
    system:
      "Browser extension UI layer that reads tweet views and replaces the views affordance with a calculated estimate.",
    engineering: ["Chrome Extension", "JavaScript", "HTML", "UI integration"],
    result:
      "Turned a platform metric into a more useful interface experiment without requiring a separate dashboard.",
    technologies: ["Chrome Extension", "JavaScript", "HTML"],
    href: "https://chromewebstore.google.com/detail/twitter-estimated-revenue/fognfoiolehcjbakhcmdppjalhapckno",
  },
  {
    name: "Distantly Near",
    date: "Dec 06, 2021",
    label: "Full Stack Application",
    description:
      "A MERN social application for connecting friends through posts, likes, search, following, and friend lists.",
    createdFor: "FAU Principles of Software Engineering Class",
    problem:
      "The project aimed to support social connection during a period shaped by pandemic distancing.",
    system:
      "A MERN application with account creation, login, posting, likes, user search, follows, and friends lists.",
    engineering: ["React.js", "Node.js", "Express.js", "MongoDB", "Postman"],
    result:
      "A class project that exercised product scope, backend APIs, database modeling, and front-end workflows.",
    technologies: ["MongoDB", "Express.js", "React.js", "Node.js"],
  },
  {
    name: "HabitHub",
    date: "Dec 16, 2023",
    label: "Product Design",
    description:
      "A dark-mode, minimalist habit tracker concept designed in Figma around calm daily progress.",
    createdFor: "Showcasing Figma UI/UX design for a minimal application.",
    problem:
      "Habit tracking can feel like administrative work instead of a motivating daily ritual.",
    system:
      "A focused mobile interface concept for entering, tracking, and celebrating daily habit wins.",
    engineering: ["Figma", "UI/UX", "Product interaction design"],
    result:
      "A cohesive visual direction for a habit tracking product with simple navigation and intentional tone.",
    technologies: ["Figma"],
  },
  {
    name: "Photography Portfolio",
    date: "Dec 26, 2020",
    label: "Front-End Website",
    description:
      "An early personal photography portfolio built with HTML, JavaScript, CSS, and SCSS.",
    createdFor: "Showcasing photography taken by Andres over the years.",
    problem:
      "A visual body of work needed a lightweight web presence while building hands-on front-end experience.",
    system:
      "A static portfolio focused on image presentation, transitions, and simple browsing.",
    engineering: ["JavaScript", "HTML", "CSS", "SCSS"],
    result:
      "An early web development project connecting visual work with front-end craft.",
    technologies: ["JavaScript", "HTML", "CSS", "SCSS"],
    href: "https://andres-photography-portfolio.netlify.app/",
  },
];
