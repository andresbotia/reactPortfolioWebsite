import { Footer } from "./components/layout/Footer";
import { Navigation } from "./components/layout/Navigation";
import { ScrollBackground } from "./components/layout/ScrollBackground";
import { Contact } from "./sections/Contact/Contact";
import { Experience } from "./sections/Experience/Experience";
import { GitHubStats } from "./sections/GitHub/GitHubStats";
import { Hero } from "./sections/Hero/Hero";
import { Stack } from "./sections/Stack/Stack";
import { Work } from "./sections/Work/Work";
import "./styles/global.css";

export default function App() {
  return (
    <>
      <ScrollBackground />
      <Navigation />
      <main>
        <Hero />
        <Work />
        <Experience />
        <GitHubStats />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
