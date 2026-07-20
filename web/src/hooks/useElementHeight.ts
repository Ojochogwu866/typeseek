import { useCallback, useRef, useState } from "react";

/**
 * Tracks an element's rendered height live via ResizeObserver.
 *
 * Returns a callback ref rather than accepting a RefObject: the element this measures is
 * often conditionally rendered (e.g. a panel that mounts/unmounts), and a plain useEffect
 * keyed on a useRef object never re-fires (ref identity never changes), so it would miss
 * the node appearing after the initial mount.
 */
export function useElementHeight() {
  const [height, setHeight] = useState<number | undefined>(undefined);
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((el: HTMLElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!el) {
      setHeight(undefined);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      setHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    observerRef.current = observer;
  }, []);

  return [ref, height] as const;
}
