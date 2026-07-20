import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getFont, getNeighbors } from "../api/client";
import { useGoogleFonts } from "../hooks/useGoogleFonts";
import { ResultGrid } from "./ResultGrid";
import { Spinner } from "./Spinner";
import { StateMessage } from "./StateMessage";

interface DetailPanelProps {
  fontId: number;
  onSelect: (id: number) => void;
  onClose: () => void;
}

export function DetailPanel({ fontId, onSelect, onClose }: DetailPanelProps) {
  const fontQuery = useQuery({
    queryKey: ["font", fontId],
    queryFn: () => getFont(fontId),
    placeholderData: keepPreviousData,
  });
  const neighborsQuery = useQuery({
    queryKey: ["neighbors", fontId],
    queryFn: () => getNeighbors(fontId),
    enabled: fontQuery.isSuccess,
    placeholderData: keepPreviousData,
  });

  const names = fontQuery.data
    ? [fontQuery.data.name, ...(neighborsQuery.data?.map((f) => f.name) ?? [])]
    : [];
  useGoogleFonts(names);

  // While hopping between fonts, keep the previous font's content on screen (correct size,
  // no collapse) and show a subtle overlay instead of unmounting everything back to a spinner.
  const isSwitching = fontQuery.isPlaceholderData || neighborsQuery.isPlaceholderData;

  return (
    <aside className="detail-panel">
      <button className="detail-panel__close" onClick={onClose}>
        close
      </button>

      {isSwitching && (
        <div className="detail-panel__overlay">
          <Spinner />
        </div>
      )}

      {fontQuery.isPending && !fontQuery.data && (
        <StateMessage>
          <Spinner />
        </StateMessage>
      )}

      {fontQuery.isError && !fontQuery.data && <StateMessage tone="error">Couldn't load this font.</StateMessage>}

      {fontQuery.data && (
        <>
          <h2 style={{ fontFamily: `"${fontQuery.data.name}", sans-serif` }}>{fontQuery.data.name}</h2>
          <div className="badge-row">
            <span className="badge">{fontQuery.data.category}</span>
            <span className="badge badge--license">{fontQuery.data.license}</span>
          </div>
          <a href={fontQuery.data.source_url} target="_blank" rel="noreferrer" className="source-link">
            View on Google Fonts
          </a>

          <h3>More like this</h3>
          {neighborsQuery.isPending && (
            <StateMessage>
              <Spinner />
            </StateMessage>
          )}
          {neighborsQuery.isError && !neighborsQuery.data && (
            <StateMessage tone="error">Couldn't load similar fonts.</StateMessage>
          )}
          {neighborsQuery.data?.length === 0 && <StateMessage>No similar fonts found.</StateMessage>}
          {neighborsQuery.data && neighborsQuery.data.length > 0 && (
            <ResultGrid results={neighborsQuery.data} onSelect={onSelect} compact scrollable maxHeight={220} />
          )}
        </>
      )}
    </aside>
  );
}
