export type ExperienceRole = {
  title: string;
  date: string;
  location: string;
  body: string;
  technologies: string[];
};

export type ExperienceGroup = {
  company: string;
  eyebrow: string;
  roles: ExperienceRole[];
};

export const experience: ExperienceGroup[] = [
  {
    company: "Banyan Air Service",
    eyebrow: "Banyan Air Service / Full-time / 2 yrs 7 mos",
    roles: [
      {
        title: "Software Engineer",
        date: "Feb 2025 - Present / 1 yr 7 mos",
        location: "Fort Lauderdale, Florida, United States / On-site",
        body:
          "Develop and maintain backend business systems for Banyan Air Service using RPG ILE IV on IBM i / AS400, supporting operational workflows and internal applications. Build modern frontend tools and services.",
        technologies: ["RPG ILE IV", "IBM i", "AS400", "Business systems", "Frontend tools"],
      },
      {
        title: "Software Developer Apprentice",
        date: "Feb 2024 - Feb 2025 / 1 yr 1 mo",
        location: "Fort Lauderdale, Florida, United States / On-site",
        body:
          "Developed and maintained backend systems using RPG ILE IV on IBM i / AS400 while building modern frontend services with React and JavaScript. Developed mobile app features using React Native and Expo.",
        technologies: [
          "RPG ILE IV",
          "IBM i",
          "AS400",
          "React",
          "JavaScript",
          "React Native",
          "Expo",
        ],
      },
    ],
  },
  {
    company: "Cendyn",
    eyebrow: "Cendyn / 2 yrs 3 mos",
    roles: [
      {
        title: "Associate Software Engineer",
        date: "May 2022 - Dec 2023 / 1 yr 8 mos",
        location: "Boca Raton, Florida, United States",
        body:
          "Collaborated with developers and engineers to design, build, and maintain applications. Built applications for platforms using common frameworks including .NET.",
        technologies: ["C#", ".NET Framework", "Application development"],
      },
      {
        title: "System Analyst Intern",
        date: "Oct 2021 - May 2022 / 8 mos",
        location: "Boca Raton, Florida, United States",
        body:
          "System analyst internship experience supporting application and systems work in a professional software environment.",
        technologies: ["Systems analysis", "Applications", "Professional software"],
      },
    ],
  },
  {
    company: "Foot Locker",
    eyebrow: "Core Retail Internship / Full-time",
    roles: [
      {
        title: "Core Retail Internship",
        date: "May 2021 - Jul 2021 / 3 mos",
        location: "United States",
        body:
          "Contributed to CI/CD, instrumentation, and monitoring on key applications while demonstrating the ability to programmatically solve challenges.",
        technologies: ["CI/CD", "Instrumentation", "Monitoring", "Applications"],
      },
    ],
  },
];
