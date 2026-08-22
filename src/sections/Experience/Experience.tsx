import { useState } from "react";
import { experience } from "../../data/experience";

export function Experience() {
  return (
    <section className="section experience-section" id="experience">
      <div className="section-kicker">Experience</div>
      <div className="section-heading-row">
        <h2>Software engineering experience.</h2>
      </div>
      <div className="timeline">
        {experience.map((item) => (
          <ExperienceCompany item={item} key={item.company} />
        ))}
      </div>
    </section>
  );
}

function ExperienceCompany({ item }: { item: (typeof experience)[number] }) {
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const activeRole = item.roles[activeRoleIndex];

  return (
    <article className="timeline-item">
      <div className="experience-company-header">
        <div>
          <p className="eyebrow">{item.eyebrow}</p>
          <h3>{activeRole.title}</h3>
        </div>
        {item.roles.length > 1 ? (
          <div className="experience-role-tabs" aria-label={`${item.company} roles`}>
            {item.roles.map((role, index) => (
              <button
                className={index === activeRoleIndex ? "is-active" : undefined}
                type="button"
                aria-pressed={index === activeRoleIndex}
                key={role.title}
                onClick={() => setActiveRoleIndex(index)}
              >
                {role.title}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="timeline-meta">
        <span>{item.location}</span>
      </div>
      <p>{activeRole.body}</p>
      <div className="tag-row">
        {activeRole.technologies.map((technology) => (
          <span key={technology}>{technology}</span>
        ))}
      </div>
    </article>
  );
}
