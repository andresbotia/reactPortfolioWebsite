import { Footer } from "./components/layout/Footer";
import { Navigation } from "./components/layout/Navigation";
import { Contact } from "./sections/Contact/Contact";
import { Experience } from "./sections/Experience/Experience";
import { Hero } from "./sections/Hero/Hero";
import { Work } from "./sections/Work/Work";
import "./styles/global.css";

export default function App() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Work />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
