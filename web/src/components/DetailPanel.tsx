import { useQuery } from "@tanstack/react-query";
import { getFont, getNeighbors } from "../api/client";
import { useGoogleFonts } from "../hooks/useGoogleFonts";
import { ResultGrid } from "./ResultGrid";

interface DetailPanelProps {
  fontId: number;
  onSelect: (id: number) => void;
  onClose: () => void;
}

export function DetailPanel({ fontId, onSelect, onClose }: DetailPanelProps) {
  const fontQuery = useQuery({ queryKey: ["font", fontId], queryFn: () => getFont(fontId) });
  const neighborsQuery = useQuery({
    queryKey: ["neighbors", fontId],
    queryFn: () => getNeighbors(fontId),
  });

  const names = fontQuery.data
    ? [fontQuery.data.name, ...(neighborsQuery.data?.map((f) => f.name) ?? [])]
    : [];
  useGoogleFonts(names);

  if (!fontQuery.data) return null;
  const font = fontQuery.data;

  return (
    <aside className="detail-panel">
      <button className="detail-panel__close" onClick={onClose}>
        close
      </button>
      <h2 style={{ fontFamily: `"${font.name}", sans-serif` }}>{font.name}</h2>
      <div className="badge-row">
        <span className="badge">{font.category}</span>
        <span className="badge badge--license">{font.license}</span>
      </div>
      <a href={font.source_url} target="_blank" rel="noreferrer" className="source-link">
        View on Google Fonts
      </a>

      <h3>More like this</h3>
      {neighborsQuery.data && (
        <ResultGrid results={neighborsQuery.data} onSelect={onSelect} compact />
      )}
    </aside>
  );
}
