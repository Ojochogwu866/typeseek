import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { searchByImage } from "./api/client";
import "./App.css";
import { DetailPanel } from "./components/DetailPanel";
import { DropZone } from "./components/DropZone";
import { ResultGrid } from "./components/ResultGrid";
import { useGoogleFonts } from "./hooks/useGoogleFonts";

function App() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const searchMutation = useMutation({ mutationFn: searchByImage });

  const results = searchMutation.data ?? [];
  useGoogleFonts(results.map((font) => font.name));

  return (
    <div className="app">
      <header>
        <h1>typeseek</h1>
        <p>Find a font by uploading an image of lettering.</p>
      </header>

      <DropZone onFile={(file) => searchMutation.mutate(file)} />

      {searchMutation.isPending && <p className="status">Searching…</p>}
      {searchMutation.isError && (
        <p className="status status--error">{(searchMutation.error as Error).message}</p>
      )}

      <div className="layout">
        <ResultGrid results={results} onSelect={setSelectedId} />

        {selectedId !== null && (
          <DetailPanel fontId={selectedId} onSelect={setSelectedId} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  );
}

export default App;
