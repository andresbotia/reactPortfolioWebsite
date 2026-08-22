import { capabilityGroups, skillGroups } from "../../data/skills";

export function Stack() {
  return (
    <section className="section stack-section" id="stack">
      <div className="section-kicker">Stack</div>
      <div className="section-heading-row">
        <h2>Technologies organized by responsibility.</h2>
      </div>
      <div className="stack-grid">
        {skillGroups.map((group) => (
          <article className="stack-group" key={group.title}>
            <h3>{group.title}</h3>
            <div>
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="capability-grid" aria-label="Engineering capabilities">
        {capabilityGroups.map((capability) => (
          <article className="capability-item" key={capability.title}>
            <h3>{capability.title}</h3>
            <p>{capability.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
