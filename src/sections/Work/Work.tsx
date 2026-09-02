import { useState } from "react";
import { lead, projects } from "../../data/projects";
import "./Work.css";

function ShotViewer() {
  const shots = lead.shots ?? [];
  const [active, setActive] = useState(0);
  const shot = shots[active];
  if (!shot) return null;

  return (
    <figure className="shot">
      <img
        className="shot-image"
        src={shot.src}
        alt={shot.alt}
        width={1600}
        height={1000}
        loading="lazy"
        decoding="async"
      />
      {/*
        The app's own four modes. This is the one place on the page that moves
        in response to a click, and it moves because it is showing something
        real about the product rather than decorating it.
      */}
      <figcaption className="shot-modes">
        {shots.map((s, i) => (
          <button
            key={s.mode}
            type="button"
            className="shot-mode"
            aria-pressed={i === active}
            onClick={() => setActive(i)}
          >
            {s.mode}
          </button>
        ))}
      </figcaption>
    </figure>
  );
}

export function Work() {
  return (
    <section className="band" id="work" aria-labelledby="work-heading">
      <div className="band-inner">
        <div className="band-row">
          <div className="band-rail">
            <span className="rail-note">Selected work</span>
          </div>
          <div className="band-body">
            <h2 className="band-title" id="work-heading">
              Three things worth reading in full
            </h2>
          </div>
        </div>

        <article className="band-row case">
          <div className="band-rail">
            <span className="rail-value">{lead.year}</span>
            <span className="rail-note">{lead.status}</span>
          </div>
          <div className="band-body">
            <h3 className="case-name">{lead.name}</h3>
            <p className="band-lead">{lead.summary}</p>

            <ShotViewer />

            <div className="case-prose">
              {lead.body?.map((paragraph) => (
                <p className="band-text" key={paragraph.slice(0, 24)}>
                  {paragraph}
                </p>
              ))}
            </div>

            <h4 className="case-subhead">Engineering</h4>
            <ul className="case-list">
              {lead.engineering?.map((item) => (
                <li key={item.slice(0, 24)}>{item}</li>
              ))}
            </ul>

            <p className="case-stack">{lead.stack.join(", ")}</p>

            <div className="link-row case-links">
              {lead.links.map((link) => (
                <a
                  className="link"
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </article>

        {projects.map((project) => (
          <article className="band-row entry" key={project.name}>
            <div className="band-rail">
              <span className="rail-value">{project.year}</span>
              <span className="rail-note">{project.status}</span>
            </div>
            <div className="band-body">
              <h3 className="entry-name">{project.name}</h3>
              <p className="band-text entry-summary">{project.summary}</p>
              <p className="case-stack">{project.stack.join(", ")}</p>
              <div className="link-row entry-links">
                {project.links.map((link) => (
                  <a
                    className="link"
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
