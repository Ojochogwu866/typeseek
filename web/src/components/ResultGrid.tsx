import type { FontResult } from "../api/types";
import { FontCard } from "./FontCard";

interface ResultGridProps {
  results: FontResult[];
  onSelect: (id: number) => void;
  compact?: boolean;
}

export function ResultGrid({ results, onSelect, compact }: ResultGridProps) {
  return (
    <div className={`result-grid ${compact ? "result-grid--compact" : ""}`}>
      {results.map((font) => (
        <FontCard key={font.id} font={font} onSelect={onSelect} />
      ))}
    </div>
  );
}
