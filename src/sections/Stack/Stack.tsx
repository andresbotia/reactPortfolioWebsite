import { skillGroups } from "../../data/skills";

export function Stack() {
  return (
    <section className="section stack-section" id="stack">
      <div className="section-kicker">Stack</div>
      <div className="section-heading-row">
        <h2>Technologies organized by responsibility.</h2>
        <p>
          The stack avoids logo clutter and focuses on the roles technologies play in real systems.
        </p>
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
    </section>
  );
}
