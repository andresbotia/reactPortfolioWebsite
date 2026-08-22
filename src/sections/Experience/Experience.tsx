import { experience } from "../../data/experience";

export function Experience() {
  return (
    <section className="section experience-section" id="experience">
      <div className="section-kicker">Experience</div>
      <div className="section-heading-row">
        <h2>Engineering work presented with factual boundaries.</h2>
        <p>
          This section is ready for employer-specific entries when Andres provides confirmed roles,
          companies, dates, and outcomes.
        </p>
      </div>
      <div className="timeline">
        {experience.map((item) => (
          <article className="timeline-item" key={item.title}>
            <p className="eyebrow">{item.eyebrow}</p>
            <h3>{item.title}</h3>
            <div className="timeline-meta">
              <span>{item.organization}</span>
              <span>{item.date}</span>
              <span>{item.location}</span>
            </div>
            <p>{item.body}</p>
            <div className="tag-row">
              {item.technologies.map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
