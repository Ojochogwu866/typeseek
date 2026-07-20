import type { FontResult } from "../api/types";

interface FontCardProps {
  font: FontResult;
  onSelect: (id: number) => void;
}

export function FontCard({ font, onSelect }: FontCardProps) {
  return (
    <button className="font-card" onClick={() => onSelect(font.id)}>
      <span className="font-card__preview" style={{ fontFamily: `"${font.name}", sans-serif` }}>
        {font.name}
      </span>
      <div className="font-card__meta">
        <span className="badge">{font.category}</span>
        <span className="badge badge--license">{font.license}</span>
      </div>
      {font.similarity !== undefined && (
        <span className="badge badge--similarity font-card__similarity">
          {Math.round(font.similarity * 100)}%
        </span>
      )}
    </button>
  );
}
