import { profile } from "../../data/profile";
import "./Hero.css";

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <div className="hero__type">
          <h1 className="hero__name">{profile.name}</h1>
          <p className="hero__lead">{profile.lead}</p>
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
          The glyph field mounts into this column client-side. It stays empty in
          the server HTML on purpose: it is decoration, the name is the content,
          and reserving the box here means the canvas can never shift the page.
        */}
        <div className="hero__field" aria-hidden="true" />
      </div>
    </section>
  );
}
