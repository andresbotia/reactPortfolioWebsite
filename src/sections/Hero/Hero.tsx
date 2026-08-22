import { ArrowDown, Download, Mail } from "lucide-react";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { profile } from "../../data/profile";

export function Hero() {
  return (
    <section className="hero-section" id="top">
      <div className="hero-topology" aria-hidden="true">
        <div className="topology-frame">
          <span className="topology-label">Live system route</span>
          <div className="topology-route">
            <span className="route-node route-node--origin" />
            <span className="route-node route-node--mid" />
            <span className="route-node route-node--target" />
            <span className="route-signal" />
          </div>
          <div className="topology-readouts">
            <span>API</span>
            <span>SQL</span>
            <span>UI</span>
          </div>
        </div>
      </div>
      <div className="hero-content">
        <p className="eyebrow">Andres Botia / Software engineer / Florida</p>
        <h1>{profile.headline}</h1>
        <p className="hero-copy">{profile.summary}</p>
        <div className="hero-actions" aria-label="Primary actions">
          <ButtonLink href="#work" variant="primary">
            View My Work <ArrowDown size={18} />
          </ButtonLink>
          <ButtonLink href="#about" variant="secondary">
            About Me
          </ButtonLink>
          <ButtonLink href={profile.resumePath} variant="ghost">
            <Download size={18} /> Resume
          </ButtonLink>
        </div>
        <div className="hero-meta">
          <a href={`mailto:${profile.email}`}>
            <Mail size={16} /> {profile.email}
          </a>
          <span>34.000 N / systems in motion</span>
        </div>
      </div>
    </section>
  );
}
