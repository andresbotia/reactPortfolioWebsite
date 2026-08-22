import { Footer } from "./components/layout/Footer";
import { Navigation } from "./components/layout/Navigation";
import { ScrollBackground } from "./components/layout/ScrollBackground";
import { About } from "./sections/About/About";
import { Contact } from "./sections/Contact/Contact";
import { Experience } from "./sections/Experience/Experience";
import { GitHubStats } from "./sections/GitHub/GitHubStats";
import { Hero } from "./sections/Hero/Hero";
import { Systems } from "./sections/Systems/Systems";
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
        <About />
        <Systems />
        <Experience />
        <GitHubStats />
        <Work />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
