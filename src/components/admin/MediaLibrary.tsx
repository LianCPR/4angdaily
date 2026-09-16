"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { MediaItem } from "@/lib/types";
import { ImageUploadButton } from "./ImageUploadButton";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({ media }: { media: MediaItem[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  async function remove(item: MediaItem) {
    if (!window.confirm("Delete this image? Articles or updates using it will show a broken image."))
      return;
    setBusyId(item.id);
    await fetch(`/api/media/${item.id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  function copyUrl(item: MediaItem) {
    navigator.clipboard?.writeText(item.url).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  return (
    <div>
      <div className="mb-6">
        <ImageUploadButton
          label="Upload image"
          onUploaded={() => router.refresh()}
        />
      </div>

      {media.length === 0 ? (
        <div className="rounded-sm border border-dashed border-line bg-paper p-10 text-center text-sm text-ink-faint">
          No media uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-sm border border-line bg-paper">
              <div className="aspect-square overflow-hidden bg-paper-deep">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.originalName} className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <p className="truncate text-xs text-ink-soft">{item.originalName}</p>
                <p className="text-xs text-ink-faint">{formatBytes(item.size)}</p>
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <button onClick={() => copyUrl(item)} className="text-ink-soft hover:text-ink">
                    {copiedId === item.id ? "Copied!" : "Copy URL"}
                  </button>
                  <button
                    disabled={busyId === item.id}
                    onClick={() => remove(item)}
                    className="text-accent-rust hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
