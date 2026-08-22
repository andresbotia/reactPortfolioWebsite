const systemNodes = [
  { title: "Enterprise Systems", meta: "IBM i / RPG", signal: "source" },
  { title: "Business Logic", meta: "Rules / workflows", signal: "process" },
  { title: "SQL / APIs", meta: "DB2 / integration", signal: "contract" },
  { title: "React Interfaces", meta: "Web / mobile", signal: "surface" },
  { title: "Operations", meta: "Users / outcomes", signal: "result" },
];

export function Systems() {
  return (
    <section className="section systems-section" id="systems">
      <div className="section-kicker">Systems</div>
      <div className="section-heading-row">
        <h2>From legacy systems to modern interfaces.</h2>
        <p>
          A portfolio visual language built around routes, waypoints, telemetry, and the systems
          work that connects old and new software.
        </p>
      </div>
      <div className="system-map" aria-label="Architecture flow">
        {systemNodes.map((node, index) => (
          <div className="system-node" key={node.title}>
            <span className="node-index">{String(index + 1).padStart(2, "0")}</span>
            <h3>{node.title}</h3>
            <p>{node.meta}</p>
            <span className="node-signal">{node.signal}</span>
          </div>
        ))}
        <div className="system-pulse system-pulse--one" />
        <div className="system-pulse system-pulse--two" />
        <div className="system-pulse system-pulse--three" />
      </div>
    </section>
  );
}
