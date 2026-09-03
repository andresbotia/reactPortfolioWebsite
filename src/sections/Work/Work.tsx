import { lead, projects } from "../../data/projects";
import { ShotViewer } from "./ShotViewer";
import "./Work.css";

export function Work() {
  return (
    <section
      className="band band--trace"
      id="work"
      aria-labelledby="work-heading"
    >
      <div className="band-inner">
        {/*
          The same progress trace Experience uses. Work is the other
          chronological list on the page — Orbital 2026, Yearly Tracker 2026,
          Grand Slam Insights 2025 — so the filling hairline means the same
          thing here that it means there.
        */}
        <div className="trace" aria-hidden="true">
          <span className="trace-fill" />
        </div>

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
