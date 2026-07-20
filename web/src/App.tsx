import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { searchByImage } from "./api/client";
import "./App.css";
import { DetailPanel } from "./components/DetailPanel";
import { DropZone } from "./components/DropZone";
import { EmptyState } from "./components/EmptyState";
import { ResultGrid } from "./components/ResultGrid";
import { Spinner } from "./components/Spinner";
import { StateMessage } from "./components/StateMessage";
import { useDelayedFlag } from "./hooks/useDelayedFlag";
import { useElementHeight } from "./hooks/useElementHeight";
import { useGoogleFonts } from "./hooks/useGoogleFonts";

const DEFAULT_LIST_HEIGHT = 300;
const SLOW_REQUEST_HINT_DELAY_MS = 4000;

function App() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const searchMutation = useMutation({ mutationFn: searchByImage });
  const isTakingAWhile = useDelayedFlag(searchMutation.isPending, SLOW_REQUEST_HINT_DELAY_MS);

  const [panelRef, panelHeight] = useElementHeight();

  const results = searchMutation.data ?? [];
  useGoogleFonts(results.map((font) => font.name));

  return (
    <div className="app">
      {searchMutation.isIdle ? (
        <EmptyState />
      ) : (
        <>
          <header>
            <h1>typeseek</h1>
            <p>Find a font by uploading an image of lettering.</p>
          </header>

          <div className="layout">
            <div className="results-area">
              {searchMutation.isPending && (
                <StateMessage variant="bordered">
                  <div className="state-message__stack">
                    <Spinner />
                    {isTakingAWhile && (
                      <p className="state-message__hint">
                        Still working — the first search can take longer while the model warms up.
                      </p>
                    )}
                  </div>
                </StateMessage>
              )}
              {searchMutation.isError && (
                <StateMessage variant="bordered" tone="error">
                  {(searchMutation.error as Error).message}
                </StateMessage>
              )}
              {searchMutation.isSuccess && results.length === 0 && (
                <StateMessage variant="bordered">No matching fonts found. Try a different image.</StateMessage>
              )}
              {searchMutation.isSuccess && results.length > 0 && (
                <ResultGrid
                  results={results}
                  onSelect={setSelectedId}
                  scrollable
                  maxHeight={selectedId !== null ? (panelHeight ?? DEFAULT_LIST_HEIGHT) : DEFAULT_LIST_HEIGHT}
                />
              )}
            </div>

            {selectedId !== null && (
              <div ref={panelRef}>
                <DetailPanel fontId={selectedId} onSelect={setSelectedId} onClose={() => setSelectedId(null)} />
              </div>
            )}
          </div>
        </>
      )}

      <DropZone
        onFile={(file) => {
          setSelectedId(null);
          searchMutation.mutate(file);
        }}
        disabled={searchMutation.isPending}
      />
    </div>
  );
}

export default App;
