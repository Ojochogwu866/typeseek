import { useCallback, useRef, useState } from "react";

interface DropZoneProps {
  onFile: (file: File) => void;
}

export function DropZone({ onFile }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      className={`drop-zone ${isDragging ? "drop-zone--active" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => handleFiles(event.target.files)}
      />
      <p>Drop an image of some lettering, or click to upload</p>
    </div>
  );
}
