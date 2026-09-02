import { useEffect, useMemo, useRef, useState } from "react";

/*
 * The hero line resolving from noise into words.
 *
 * This is deliberately not a second load animation. PLAN.md §5 allows exactly
 * one orchestrated page-load moment, and the glyph field already had it. Rather
 * than sequence two effects — which reads as two beats, and moves attention
 * right-to-left against reading order — the decode shares the field's envelope
 * and, more importantly, its alphabet: the charset below is the field's own
 * measured ramp plus a few width-matched additions. One idea, two surfaces,
 * settling once.
 *
 * Accessibility. While it animates, the visible layer is aria-hidden and a
 * visually-hidden sibling carries the real sentence, so a screen reader always
 * gets the right words no matter when the user reaches the line. aria-live="off"
 * would not have been enough: it suppresses announcements of changes, but a user
 * navigating onto the line mid-animation would still be read whatever the text
 * node currently holds, which is gibberish. Both the extra node and the
 * aria-hidden exist only while running — the prerendered HTML and the resting
 * DOM are a single clean copy of the sentence.
 *
 * Layout. Each word renders a hidden ghost of its final text that sets the box,
 * with the animating characters absolutely positioned inside it. Every word
 * therefore occupies exactly its final size for the whole animation, so nothing
 * re-wraps and nothing shifts — without measuring anything in JavaScript.
 */

/* The glyph field's ramp, plus a handful of similar-width glyphs so the noise
   fills a word's box at roughly the density of real text. */
const CHARSET = "·:~+=*xowsn&@%#";

const TOTAL_MS = 1900;
const CHAR_MS = 420;
/* Cadence of the random swap. Faster reads as flicker, slower reads as a
   slideshow. */
const BUCKET_MS = 55;

type Props = { text: string; className?: string };

export function DecodeLine({ text, className }: Props) {
  /* null means "at rest": render the sentence plainly, exactly as the server
     did. Only ever set from inside a rAF callback, never during render. */
  const [frame, setFrame] = useState<string | null>(null);
  /* How many leading characters have locked. Resolution is strictly
     left-to-right, so one number describes it. */
  const [resolved, setResolved] = useState(0);
  const last = useRef<string | null>(null);

  const words = useMemo(() => {
    const out: { word: string; start: number }[] = [];
    let index = 0;
    for (const word of text.split(" ")) {
      out.push({ word, start: index });
      index += word.length + 1;
    }
    return out;
  }, [text]);

  useEffect(() => {
    /* Reduced motion gets the finished sentence and nothing else. Read inside
       the effect, never during render. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const n = text.length;
    const stagger = n > 1 ? (TOTAL_MS - CHAR_MS) / (n - 1) : 0;
    /* Reseeded per load so the noise differs between visits while staying
       stable within a bucket, which is what stops it strobing at 60fps. */
    const seed = Math.floor(Math.random() * 100000);
    const t0 = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = now - t0;
      const bucket = Math.floor(t / BUCKET_MS);
      let out = "";
      let done = true;
      let locked = 0;

      for (let i = 0; i < n; i++) {
        const char = text[i];
        const isLocked = t >= i * stagger + CHAR_MS;
        if (isLocked) locked = i + 1;
        if (char === " ") {
          out += " ";
          continue;
        }
        if (isLocked) {
          out += char;
          continue;
        }
        done = false;
        out += CHARSET[(i * 31 + bucket * 17 + seed) % CHARSET.length];
      }

      if (out !== last.current) {
        last.current = done ? null : out;
        setFrame(done ? null : out);
        setResolved(locked);
      }
      if (!done) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  if (frame === null) {
    return <p className={className}>{text}</p>;
  }

  return (
    <p className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map(({ word, start }, i) => (
          <span className="decode-word" key={start}>
            <span className="decode-ghost">{word}</span>
            {/*
              Split at the lock point so colour resolves with the glyphs.
              Colouring the whole line while it runs meant the finished words
              snapped from accent to body grey at the end — a second moment,
              which is exactly what this effect is meant not to be.
            */}
            <span className="decode-live">
              <span className="decode-done">
                {word.slice(0, Math.max(0, Math.min(word.length, resolved - start)))}
              </span>
              <span className="decode-noise">
                {frame.slice(
                  start + Math.max(0, Math.min(word.length, resolved - start)),
                  start + word.length
                )}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </p>
  );
}
