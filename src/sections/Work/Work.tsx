import { ChevronDown, ExternalLink } from "lucide-react";
import type { CSSProperties } from "react";
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
        <ProjectVisual project={project} />
      </div>
      <div className="project-content">
        <p className="eyebrow">
          {project.label}
          {project.date ? ` / ${project.date}` : ""}
        </p>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <div className="project-brief" aria-label={`${project.name} summary`}>
          {project.problem ? (
            <span>
              <strong>Problem</strong>
              {project.problem}
            </span>
          ) : null}
          {project.result ? (
            <span>
              <strong>Result</strong>
              {project.result}
            </span>
          ) : null}
        </div>
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

function ProjectVisual({ project }: { project: (typeof projects)[number] }) {
  if (project.visual === "yearly-tracker") {
    return (
      <div className="app-simulation">
        <div className="phone-shell">
          <div className="phone-status">
            <span>2026</span>
            <span>72%</span>
          </div>
          <div className="app-header">
            <span>Yearly Tracker</span>
            <strong>Build consistent systems.</strong>
          </div>
          <div className="progress-ring" aria-hidden="true">
            <span>68%</span>
          </div>
          <div className="habit-list">
            <span style={{ "--fill": "82%" } as CSSProperties}>Ship work</span>
            <span style={{ "--fill": "64%" } as CSSProperties}>Train</span>
            <span style={{ "--fill": "48%" } as CSSProperties}>Read</span>
          </div>
        </div>
      </div>
    );
  }

  if (project.visual === "grand-slam") {
    return (
      <div className="grand-slam-preview">
        <div className="grand-slam-sidebar">
          <strong>Grand Slam Insights</strong>
          <span>Today</span>
          <span>Best Bets</span>
          <span>Matchups</span>
          <span>History</span>
          <span>Model Lab</span>
        </div>
        <div className="grand-slam-board">
          <div className="grand-slam-toolbar">
            <strong>Today's Card</strong>
            <span>08/22/2026</span>
          </div>
          <div className="grand-slam-kpis">
            <span>Weekly ML <strong>55.8%</strong></span>
            <span>Weekly totals <strong>64%</strong></span>
            <span>Best <strong>64.2%</strong></span>
          </div>
          <div className="grand-slam-table">
            {["Over 7.5", "Houston Astros", "No run 1st", "Over 8"].map((pick) => (
              <span key={pick}>
                <strong>{pick}</strong>
                <em>73% model / pending</em>
              </span>
            ))}
          </div>
          <div className="grand-slam-chart">
            <span className="chart-bar chart-bar--one" />
            <span className="chart-bar chart-bar--two" />
            <span className="chart-bar chart-bar--three" />
            <span className="chart-line" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mock-window">
      <div className="mock-topbar" />
      <div className="mock-route" />
      <div className="mock-panels">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
