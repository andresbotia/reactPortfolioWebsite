import { ExternalLink } from "lucide-react";
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
          <article className="project-case" key={project.name}>
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
              <dl className="case-grid">
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
                {project.result ? (
                  <>
                    <dt>Result</dt>
                    <dd>{project.result}</dd>
                  </>
                ) : null}
              </dl>
              <div className="tag-row">
                {project.technologies.map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
              </div>
              {project.href ? (
                <a className="inline-link" href={project.href} target="_blank" rel="noreferrer">
                  View project <ExternalLink size={16} />
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
