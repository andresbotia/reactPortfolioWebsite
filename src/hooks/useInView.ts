import type { RefObject } from "react";
import { useEffect, useState } from "react";

export function useInView<T extends Element>(ref: RefObject<T | null>, rootMargin = "0px") {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return visible;
}
