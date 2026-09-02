import { useEffect, useRef, useState } from "react";
import { createGlyphField, type GlyphField as Field } from "./turbofan";

/*
 * Client-only wrapper around the glyph field.
 *
 * Deliberately not React.lazy: renderToString's behaviour with an unresolved
 * lazy module is version-dependent, and what this actually needs is client-only
 * mounting, not suspension. The parent reserves the box; this fills it.
 *
 * matchMedia is read inside an effect, never during render, so there is nothing
 * for hydration to disagree about.
 */
export function GlyphField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let field: Field | null = null;
    let cancelled = false;
    let io: IntersectionObserver | null = null;
    let onVisibility: (() => void) | null = null;
    let onMotionChange: (() => void) | null = null;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // The atlas is rasterised from IBM Plex Mono, so it has to wait for the
    // face to load or every glyph is measured against the fallback.
    const fontReady = document.fonts
      ? document.fonts.load('9px "IBM Plex Mono"').then(() => undefined)
      : Promise.resolve();

    fontReady.catch(() => undefined).then(() => {
      if (cancelled) return;

      field = createGlyphField(canvas);
      // Canvas unavailable: the column stays empty black and the hero is a
      // well-set headline. Nothing to clean up, nothing to announce.
      if (!field) return;

      setReady(true);
      /* Exposed for the frame-budget check in the build gate. */
      (window as unknown as { __glyphField?: Field }).__glyphField = field;

      let onScreen = true;

      const sync = () => {
        if (!field) return;
        if (motion.matches) {
          // One static, composed frame. It has to look intentional on its own.
          field.stop();
          field.renderOnce();
          return;
        }
        if (onScreen && !document.hidden) field.start();
        else field.stop();
      };

      if (typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver(
          (entries) => {
            onScreen = entries[0]?.isIntersecting ?? true;
            sync();
          },
          { rootMargin: "120px" }
        );
        io.observe(canvas);
      }

      onVisibility = () => sync();
      document.addEventListener("visibilitychange", onVisibility);

      onMotionChange = () => sync();
      motion.addEventListener("change", onMotionChange);

      sync();
    });

    return () => {
      cancelled = true;
      io?.disconnect();
      if (onVisibility) document.removeEventListener("visibilitychange", onVisibility);
      if (onMotionChange) motion.removeEventListener("change", onMotionChange);
      field?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`hero__canvas${ready ? " is-ready" : ""}`}
      aria-hidden="true"
    />
  );
}
