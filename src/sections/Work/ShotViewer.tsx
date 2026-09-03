import { useCallback, useEffect, useRef, useState } from "react";
import { lead } from "../../data/projects";

/*
 * Orbital's mode switcher, plus a one-time crossfade through the four modes
 * when the case study first scrolls into view.
 *
 * Why this is not a reveal animation: the sequence shows the product's actual
 * mode-switching, using the same four captures the manual control uses. It is a
 * demonstration, not a fade-in, which is why it belongs here and why nothing
 * like it appears on the other two projects.
 *
 * The four images are stacked and crossfaded rather than swapped on one <img>.
 * That also fixes the manual switcher, which previously swapped `src` and so
 * flashed empty the first time each mode was chosen.
 */

const HOLD_MS = 420;

export function ShotViewer() {
  const shots = lead.shots ?? [];
  const [active, setActive] = useState(0);
  const frameRef = useRef<HTMLDivElement | null>(null);

  /* Loaded flags live in a ref as well as state: the timers read current values
     without being torn down and rebuilt, while the render still updates. */
  const [, bumpLoaded] = useState(0);
  const loadedRef = useRef<boolean[]>(shots.map(() => false));

  /* Set the moment the user touches the control. Once true the auto-sequence is
     over for good: it never fights a real click. */
  const claimedRef = useRef(false);
  const playedRef = useRef(false);
  const pendingRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  const startSequence = useCallback(() => {
    pendingRef.current = false;
    if (claimedRef.current) return;

    /* Built from what has actually decoded. A mode whose capture has not
       arrived is skipped rather than shown as an empty frame, so a slow
       connection degrades to a shorter sequence instead of a broken one. */
    const order: number[] = [];
    for (let i = 1; i < loadedRef.current.length; i++) {
      if (loadedRef.current[i]) order.push(i);
    }
    if (order.length === 0) return;
    order.push(0); /* land back on the resting mode */

    order.forEach((index, step) => {
      timersRef.current.push(
        window.setTimeout(
          () => {
            if (claimedRef.current) return;
            setActive(index);
          },
          (step + 1) * HOLD_MS
        )
      );
    });
  }, []);

  useEffect(() => {
    const node = frameRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    /* Reduced motion gets the resting capture and no sequence at all. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        /* Once only. Disconnecting here is what stops it re-firing on the way
           back up and down again. */
        observer.disconnect();
        if (playedRef.current) return;
        playedRef.current = true;

        if (loadedRef.current.filter(Boolean).length > 1) startSequence();
        /* Nothing to fade through yet, so hand off to onLoad rather than
           blocking the sequence behind a network round trip. */
        else pendingRef.current = true;
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimers();
    };
  }, [startSequence, clearTimers]);

  const handleLoad = (index: number) => {
    loadedRef.current[index] = true;
    bumpLoaded((n) => n + 1);
    if (pendingRef.current && loadedRef.current.filter(Boolean).length > 1) {
      startSequence();
    }
  };

  const choose = (index: number) => {
    /* A real click ends the sequence immediately and permanently. */
    claimedRef.current = true;
    clearTimers();
    setActive(index);
  };

  if (!shots.length) return null;

  return (
    <figure className="shot">
      {/* Fixed aspect ratio on the frame with the images absolutely filling it:
          the box is identical before, during and after, so none of this can
          shift the page. */}
      <div className="shot-frame" ref={frameRef}>
        {shots.map((shot, i) => (
          <img
            key={shot.mode}
            className={`shot-image${i === active ? " is-active" : ""}`}
            src={shot.src}
            alt={shot.alt}
            width={1600}
            height={1000}
            loading="lazy"
            decoding="async"
            /* Only the visible capture is exposed; otherwise a screen reader
               reads four descriptions of the same figure. */
            aria-hidden={i === active ? undefined : true}
            onLoad={() => handleLoad(i)}
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
            aria-pressed={i === active}
            onClick={() => choose(i)}
          >
            {shot.mode}
          </button>
        ))}
      </figcaption>
    </figure>
  );
}
