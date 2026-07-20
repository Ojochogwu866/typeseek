import LocomotiveScroll from "locomotive-scroll";
import { useEffect, type RefObject } from "react";

/** Smooth-scrolls a specific container (not the page) so it never fights position: sticky elsewhere. */
export function useLocomotiveScroll(containerRef: RefObject<HTMLDivElement | null>, deps: unknown[]) {
  useEffect(() => {
    const wrapper = containerRef.current;
    const content = wrapper?.firstElementChild as HTMLElement | null;
    if (!wrapper || !content) return;

    const scroll = new LocomotiveScroll({
      lenisOptions: { wrapper, content },
    });

    return () => scroll.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
