import { ArrowDown, Download, Mail } from "lucide-react";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { profile } from "../../data/profile";

export function Hero() {
  return (
    <section className="hero-section" id="top">
      <div className="hero-content">
        <p className="eyebrow">Software engineer / Florida</p>
        <h1>{profile.headline}</h1>
        <p className="hero-copy">{profile.summary}</p>
        <div className="hero-actions" aria-label="Primary actions">
          <ButtonLink href="#work" variant="primary">
            View My Work <ArrowDown size={18} />
          </ButtonLink>
          <ButtonLink href="#experience" variant="secondary">
            Experience
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
