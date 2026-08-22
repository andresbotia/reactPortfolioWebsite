import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useState } from "react";
import { projects } from "../../data/projects";

const yearlyTrackerShots = [
  { src: "/yearly-tracker-goals.png", label: "Goals" },
  { src: "/yearly-tracker-habits.png", label: "Habits" },
  { src: "/yearly-tracker-widgets.png", label: "Widgets" },
  { src: "/yearly-tracker-history.png", label: "History" },
  { src: "/yearly-tracker-themes.png", label: "Themes" },
];

const grandSlamShots = [
  { src: "/grand-slam-matchups.png", label: "Matchups" },
  { src: "/grand-slam-best-bets.png", label: "Best Bets" },
  { src: "/grand-slam-history.png", label: "History" },
  { src: "/grand-slam-model-lab.png", label: "Model Lab" },
];

export function Work() {
  return (
    <section className="section work-section" id="work">
      <div className="section-kicker">Featured Work</div>
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
      <div className="project-visual">
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
      <PreviewCarousel
        className="yearly-tracker-carousel"
        frameClassName="yearly-tracker-shot"
        imageClassName="yearly-tracker-image"
        label="Yearly Tracker preview images"
        shots={yearlyTrackerShots}
        showCaptions
      />
    );
  }

  if (project.visual === "grand-slam") {
    return (
      <PreviewCarousel
        className="grand-slam-carousel"
        frameClassName="grand-slam-frame"
        imageClassName="grand-slam-image"
        label="Grand Slam Insights preview images"
        shots={grandSlamShots}
      />
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

function PreviewCarousel({
  className,
  frameClassName,
  imageClassName,
  label,
  shots,
  showCaptions = false,
}: {
  className: string;
  frameClassName: string;
  imageClassName: string;
  label: string;
  shots: { src: string; label: string }[];
  showCaptions?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndex = shots.length - 1;
  const activeShot = shots[activeIndex];

  function showPrevious() {
    setActiveIndex((index) => (index === 0 ? lastIndex : index - 1));
  }

  function showNext() {
    setActiveIndex((index) => (index === lastIndex ? 0 : index + 1));
  }

  return (
    <div className={`preview-carousel ${className}`} aria-label={label} role="group">
      <div className="preview-carousel-viewport">
        <div
          className="preview-carousel-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {shots.map((shot) => (
            <figure className={`preview-carousel-frame ${frameClassName}`} key={shot.src}>
              <img
                className={imageClassName}
                src={shot.src}
                alt={`${shot.label} preview`}
                loading="lazy"
                decoding="async"
              />
              {showCaptions ? <figcaption>{shot.label}</figcaption> : null}
            </figure>
          ))}
        </div>
      </div>
      <button
        className="preview-carousel-button preview-carousel-button--previous"
        type="button"
        aria-label={`Show previous ${label}`}
        onClick={showPrevious}
      >
        <ChevronLeft size={16} />
      </button>
      <button
        className="preview-carousel-button preview-carousel-button--next"
        type="button"
        aria-label={`Show next ${label}`}
        onClick={showNext}
      >
        <ChevronRight size={16} />
      </button>
      <div className="preview-carousel-dots" aria-label={`${label} slides`}>
        {shots.map((shot, index) => (
          <button
            className={index === activeIndex ? "is-active" : undefined}
            type="button"
            aria-label={`Show ${shot.label}`}
            aria-current={index === activeIndex ? "true" : undefined}
            key={shot.src}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
      <span className="sr-only">
        Showing {activeShot.label}, image {activeIndex + 1} of {shots.length}
      </span>
    </div>
  );
}
