import { ArrowDown, Download, Mail } from "lucide-react";
import { lazy, Suspense, useRef } from "react";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { profile } from "../../data/profile";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useWebGLSupported } from "../../hooks/useWebGLSupported";
import { ErrorBoundary } from "../../lib/ErrorBoundary";
import { HeroFallback } from "./HeroFallback";

const HeroScene = lazy(() => import("../../three/scenes/HeroScene"));

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const inView = useInView(heroRef, "120px");
  const reducedMotion = useReducedMotion();
  const webglSupported = useWebGLSupported();
  const shouldRenderScene = webglSupported && !reducedMotion && inView;

  return (
    <section className="hero-section" id="top" ref={heroRef}>
      <div className="hero-visual">
        <ErrorBoundary fallback={<HeroFallback />}>
          {shouldRenderScene ? (
            <Suspense fallback={<HeroFallback />}>
              <HeroScene />
            </Suspense>
          ) : (
            <HeroFallback />
          )}
        </ErrorBoundary>
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
