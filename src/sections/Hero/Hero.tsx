import { profile } from "../../data/profile";
import { DecodeLine } from "./DecodeLine";
import { GlyphField } from "./GlyphField";
import "./Hero.css";

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <div className="hero__type">
          <h1 className="hero__name">{profile.name}</h1>
          <DecodeLine className="hero__lead" text={profile.lead} />
          <nav className="hero__links" aria-label="Primary">
            <a className="hero__link" href="#work">
              Work
            </a>
            <a className="hero__link" href={profile.resumePath}>
              Résumé
            </a>
          </nav>
        </div>

        {/*
          The canvas element itself is static markup, so the server and client
          render it identically and there is nothing for hydration to disagree
          about. Everything that touches a browser API — the atlas, the rAF
          loop, matchMedia — happens inside an effect. The box is sized by CSS,
          so the field can never shift the page.
        */}
        <div className="hero__field" aria-hidden="true">
          <GlyphField />
        </div>
      </div>
    </section>
  );
}
