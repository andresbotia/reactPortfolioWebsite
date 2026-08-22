import type { CSSProperties } from "react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useWebGLSupported } from "../../hooks/useWebGLSupported";
import { ErrorBoundary } from "../../lib/ErrorBoundary";

const DitherBackground = lazy(() => import("../../three/scenes/DitherBackground"));

function getScrollProgress() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(1, Math.max(0, window.scrollY / max));
}

export function ScrollBackground() {
  const reducedMotion = useReducedMotion();
  const webglSupported = useWebGLSupported();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion || !webglSupported) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrollProgress(getScrollProgress());
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [reducedMotion, webglSupported]);

  if (reducedMotion || !webglSupported) return <div className="dither-fallback" aria-hidden="true" />;

  return (
    <div
      className="site-dither-background"
      style={
        {
          "--scroll": scrollProgress,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <ErrorBoundary fallback={<div className="dither-fallback" />}>
        <Suspense fallback={<div className="dither-fallback" />}>
          <DitherBackground scrollProgress={scrollProgress} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
