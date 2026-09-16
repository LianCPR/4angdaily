"use client";

import { useRef, useState } from "react";
import type { MediaItem } from "@/lib/types";

export function ImageUploadButton({
  onUploaded,
  label = "Upload image",
  className = "btn-secondary",
}: {
  onUploaded: (media: MediaItem) => void;
  label?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      onUploaded(data.media as MediaItem);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={className}
      >
        {uploading ? "Uploading…" : label}
      </button>
      {error && <p className="mt-2 text-xs text-accent-rust">{error}</p>}
    </div>
  );
}
