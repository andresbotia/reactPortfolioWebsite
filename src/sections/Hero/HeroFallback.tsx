import type { CSSProperties } from "react";

export function HeroFallback() {
  return (
    <div className="hero-fallback" aria-hidden="true">
      <div className="radar-grid">
        {Array.from({ length: 7 }).map((_, index) => (
          <span key={index} style={{ "--i": index } as CSSProperties} />
        ))}
      </div>
      <div className="fallback-route fallback-route--a" />
      <div className="fallback-route fallback-route--b" />
      <div className="fallback-node fallback-node--one" />
      <div className="fallback-node fallback-node--two" />
      <div className="fallback-node fallback-node--three" />
    </div>
  );
}
