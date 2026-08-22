import { ChevronDown, ExternalLink } from "lucide-react";
import { useState } from "react";
import { projects } from "../../data/projects";

export function Work() {
  return (
    <section className="section work-section" id="work">
      <div className="section-kicker">Featured Work</div>
      <div className="section-heading-row">
        <h2>Projects treated like products, not thumbnails.</h2>
        <p>
          Public work from the current portfolio has been recast into case-study compositions with
          problem, system, engineering, and result where available.
        </p>
      </div>
      <div className="project-list">
        {projects.map((project, index) => (
          <ProjectCase key={project.name} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}

function ProjectCase({ project, index }: { project: (typeof projects)[number]; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const panelId = `case-study-${index}`;
  const projectLinks =
    project.links ?? (project.href ? [{ label: "View project", href: project.href }] : []);

  return (
    <article className={`project-case ${expanded ? "project-case--expanded" : ""}`}>
      <div className="project-visual" aria-hidden="true">
        <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
        <div className="mock-window">
          <div className="mock-topbar" />
          <div className="mock-route" />
          <div className="mock-panels">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
      <div className="project-content">
        <p className="eyebrow">
          {project.label}
          {project.date ? ` / ${project.date}` : ""}
        </p>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <div className="tag-row">
          {project.technologies.map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
        <div className="project-actions">
          <button
            className="inline-button"
            type="button"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => setExpanded((value) => !value)}
          >
            Case study <ChevronDown size={16} />
          </button>
          {projectLinks.map((link) => (
            <a
              className="inline-link"
              href={link.href}
              target="_blank"
              rel="noreferrer"
              key={link.href}
            >
              {link.label} <ExternalLink size={16} />
            </a>
          ))}
        </div>
        <div className="case-study-panel" id={panelId} hidden={!expanded}>
          <dl className="case-grid">
            {project.createdFor ? (
              <>
                <dt>Context</dt>
                <dd>{project.createdFor}</dd>
              </>
            ) : null}
            {project.problem ? (
              <>
                <dt>Problem</dt>
                <dd>{project.problem}</dd>
              </>
            ) : null}
            {project.system ? (
              <>
                <dt>System</dt>
                <dd>{project.system}</dd>
              </>
            ) : null}
            {project.engineering ? (
              <>
                <dt>Engineering</dt>
                <dd>{project.engineering.join(" / ")}</dd>
              </>
            ) : null}
            {project.result ? (
              <>
                <dt>Result</dt>
                <dd>{project.result}</dd>
              </>
            ) : null}
          </dl>
        </div>
      </div>
    </article>
  );
}
