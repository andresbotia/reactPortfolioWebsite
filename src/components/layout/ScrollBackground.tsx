import type { CSSProperties } from "react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useWebGLSupported } from "../../hooks/useWebGLSupported";
import { ErrorBoundary } from "../../lib/ErrorBoundary";

const ScrollVoxelField = lazy(() => import("../../three/scenes/ScrollVoxelField"));

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

  if (reducedMotion || !webglSupported) return <div className="voxel-fallback" aria-hidden="true" />;

  return (
    <div
      className="scroll-voxel-background"
      style={
        {
          "--scroll": scrollProgress,
          "--pulse-a": `${18 + scrollProgress * 52}%`,
          "--pulse-b": `${82 - scrollProgress * 46}%`,
          "--pulse-c": `${38 + scrollProgress * 30}%`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <ErrorBoundary fallback={<div className="voxel-fallback" />}>
        <Suspense fallback={<div className="voxel-fallback" />}>
          <ScrollVoxelField scrollProgress={scrollProgress} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
