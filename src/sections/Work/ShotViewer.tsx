import { useEffect, useRef, useState } from "react";
import { lead } from "../../data/projects";

/*
 * Orbital's frame: a screen recording of the live app cycling its own modes,
 * with the manual switcher on top.
 *
 * This replaces a four-image crossfade that stepped every 420ms. The idea was
 * right and the mechanism was wrong: cutting between stills reads as a stutter
 * rather than as software running, because nothing moves *within* a mode. The
 * recording shows the globe turning, the event stream filling and the telemetry
 * updating, which is what the project actually is. Slowing the crossfade down
 * would not have fixed that; only real footage does.
 *
 * The video is the idle state. Choosing a mode pauses it and shows that mode's
 * still, which is the same relationship the crossfade had with the switcher.
 */

export function ShotViewer() {
  const shots = lead.shots ?? [];
  /* null means idle: the recording is what you see. A click selects a still and
     there is no way back, which is deliberate — once someone has taken control
     of the control, it stays theirs. */
  const [selected, setSelected] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const selectedRef = useRef<number | null>(null);

  useEffect(() => {
    const node = frameRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    /* Reduced motion never plays and, because preload is none, never downloads
       the 572 KB either. The poster is the resting capture, so the frame looks
       finished rather than empty. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const video = videoRef.current;
        if (!video) return;
        if (entries[0]?.isIntersecting) {
          if (selectedRef.current === null) void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const choose = (index: number) => {
    selectedRef.current = index;
    setSelected(index);
    videoRef.current?.pause();
  };

  if (!shots.length) return null;
  const poster = shots[0]?.src;

  return (
    <figure className="shot">
      {/* Fixed aspect ratio on the frame with everything absolutely filling it,
          so the reserved box is identical whether the video, a still, or only
          the poster is showing. Nothing here can shift the page. */}
      <div className="shot-frame" ref={frameRef}>
        <video
          ref={videoRef}
          className={`shot-video${selected === null ? " is-active" : ""}`}
          src="/orbital/modes.webm"
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          /* Decoration: the four stills below carry the real alt text, and the
             surrounding prose already describes the modes. */
          aria-hidden="true"
          tabIndex={-1}
        />

        {shots.map((shot, i) => (
          <img
            key={shot.mode}
            className={`shot-image${i === selected ? " is-active" : ""}`}
            src={shot.src}
            alt={shot.alt}
            width={1600}
            height={1000}
            loading="lazy"
            decoding="async"
            /* Only the visible capture is exposed; otherwise a screen reader
               reads four descriptions of the same figure. */
            aria-hidden={i === selected ? undefined : true}
          />
        ))}
      </div>

      {/*
        The app's own four modes. This is the one place on the page that moves
        in response to a click, and it moves because it is showing something
        real about the product rather than decorating it.
      */}
      <figcaption className="shot-modes">
        {shots.map((shot, i) => (
          <button
            key={shot.mode}
            type="button"
            className="shot-mode"
            aria-pressed={i === selected}
            onClick={() => choose(i)}
          >
            {shot.mode}
          </button>
        ))}
      </figcaption>
    </figure>
  );
}
