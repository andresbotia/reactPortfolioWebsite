import { Footer } from "./components/layout/Footer";
import { Navigation } from "./components/layout/Navigation";
import { About } from "./sections/About/About";
import { Contact } from "./sections/Contact/Contact";
import { Experience } from "./sections/Experience/Experience";
import { Hero } from "./sections/Hero/Hero";
import { Systems } from "./sections/Systems/Systems";
import { Stack } from "./sections/Stack/Stack";
import { Work } from "./sections/Work/Work";
import "./styles/global.css";

export default function App() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <About />
        <Systems />
        <Experience />
        <Work />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
