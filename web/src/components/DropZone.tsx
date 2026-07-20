import { useCallback, useEffect, useRef, useState } from "react";

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ onFile, disabled }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (disabled) return;
      const file = files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }

      setError(null);
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current.url);
        return { url: URL.createObjectURL(file), name: file.name };
      });
      onFile(file);
    },
    [disabled, onFile],
  );

  const openFilePicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div
      className={`drop-zone ${isDragging ? "drop-zone--active" : ""} ${disabled ? "drop-zone--disabled" : ""}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      onClick={openFilePicker}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openFilePicker();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          // Reset so selecting the same file again still fires a change event.
          event.target.value = "";
        }}
      />
      {error ? (
        <p className="drop-zone__error">{error}</p>
      ) : preview ? (
        <>
          <img src={preview.url} alt="" className="drop-zone__thumb" />
          <p>{preview.name} — click to upload a different image</p>
        </>
      ) : (
        <p>Drop an image of some lettering, or click to upload</p>
      )}
    </div>
  );
}
