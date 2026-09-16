"use client";

import type { MediaItem } from "@/lib/types";
import { ImageUploadButton } from "./ImageUploadButton";

export function CoverImagePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  return (
    <div>
      <label className="field-label">Cover image</label>
      {value ? (
        <div className="overflow-hidden rounded-sm border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="aspect-[16/9] w-full object-cover" />
          <div className="flex items-center justify-between border-t border-line bg-paper-soft px-3 py-2">
            <span className="truncate text-xs text-ink-faint">{value}</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-xs text-accent-rust hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-line bg-paper-soft">
          <p className="text-sm text-ink-faint">No cover image yet</p>
          <ImageUploadButton
            label="Upload cover"
            onUploaded={(media: MediaItem) => onChange(media.url)}
          />
        </div>
      )}
    </div>
  );
}
