import { facts, profile } from "../../data/profile";

export function About() {
  return (
    <section className="section about-section" id="about">
      <div className="section-kicker">About</div>
      <div className="split-layout">
        <div>
          <h2>Software should make complicated work feel simple.</h2>
        </div>
        <div className="prose">
          <p>
            Andres builds at the boundary between user-facing interfaces and the business systems
            behind them. The differentiator is range: modern web apps, APIs, data, automation, and
            operational platforms that often include older enterprise technology.
          </p>
          <p>
            The public portfolio shows front-end, product, and full-stack learning through shipped
            personal and academic projects. This new site is structured to grow into deeper case
            studies as more professional details are added.
          </p>
          <ul className="fact-list">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <p className="location-line">{profile.location}</p>
        </div>
      </div>
    </section>
  );
}
