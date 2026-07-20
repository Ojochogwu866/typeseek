import { useEffect, useRef, useState } from "react";
import type { FontResult } from "../api/types";
import { useLocomotiveScroll } from "../hooks/useLocomotiveScroll";
import { FontCard } from "./FontCard";

interface ResultGridProps {
  results: FontResult[];
  onSelect: (id: number) => void;
  compact?: boolean;
  /** Caps the grid's height and shows a "+N more" hint that tracks scroll position. */
  scrollable?: boolean;
  maxHeight?: number;
}

export function ResultGrid({ results, onSelect, compact, scrollable, maxHeight = 300 }: ResultGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [remaining, setRemaining] = useState(0);

  useLocomotiveScroll(scrollRef, [results, maxHeight]);

  useEffect(() => {
    if (!scrollable) return;
    const el = scrollRef.current;
    if (!el || results.length === 0) return;

    const updateRemaining = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight) {
        setRemaining(0);
        return;
      }
      const hiddenBelow = scrollHeight - (scrollTop + clientHeight);
      const perItem = scrollHeight / results.length;
      setRemaining(Math.max(0, Math.round(hiddenBelow / perItem)));
    };

    updateRemaining();
    el.addEventListener("scroll", updateRemaining);
    window.addEventListener("resize", updateRemaining);
    return () => {
      el.removeEventListener("scroll", updateRemaining);
      window.removeEventListener("resize", updateRemaining);
    };
  }, [scrollable, results, maxHeight]);

  const grid = (
    <div className={`result-grid ${compact ? "result-grid--compact" : ""}`}>
      {results.map((font) => (
        <FontCard key={font.id} font={font} onSelect={onSelect} />
      ))}
    </div>
  );

  if (!scrollable) return grid;

  return (
    <div className="result-grid-wrapper">
      <div className="result-grid-scroll" ref={scrollRef} style={{ maxHeight }}>
        {grid}
      </div>
      {remaining > 0 && <div className="result-grid-more">+{remaining} more</div>}
    </div>
  );
}
