"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentStatus, UpdateEntry } from "@/lib/types";
import { UPDATE_TYPES } from "@/lib/types";
import { RichTextEditor } from "./RichTextEditor";
import { CoverImagePicker } from "./CoverImagePicker";
import { UpdateTypeBadge } from "../UpdateRow";
import { annotateHeadings, formatDate } from "@/lib/text";

export function UpdateForm({ initial }: { initial?: UpdateEntry }) {
  const router = useRouter();
  const isEditing = Boolean(initial);

  const [version, setVersion] = useState(initial?.version || "");
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [type, setType] = useState(initial?.type || UPDATE_TYPES[0]);
  const [coverImage, setCoverImage] = useState<string | null>(initial?.coverImage || null);
  const [contentHtml, setContentHtml] = useState(initial?.contentHtml || "");
  const [status, setStatus] = useState<ContentStatus>(initial?.status || "draft");
  const [view, setView] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(nextStatus: ContentStatus) {
    setSaving(true);
    setError(null);
    const payload = { version, title, description, type, coverImage, contentHtml, status: nextStatus };

    try {
      const res = await fetch(
        isEditing ? `/api/updates/${initial!.id}` : "/api/updates",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save this update.");
        setSaving(false);
        return;
      }
      router.push("/admin/updates");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setSaving(false);
    }
  }

  async function remove() {
    if (!initial) return;
    if (!window.confirm(`Delete "${initial.version} — ${initial.title}"? This can't be undone.`)) return;
    setSaving(true);
    await fetch(`/api/updates/${initial.id}`, { method: "DELETE" });
    router.push("/admin/updates");
    router.refresh();
  }

  const { html: previewHtml } = annotateHeadings(contentHtml);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="flex gap-3">
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="v2.7"
            className="w-28 border-none bg-transparent font-display text-3xl text-ink-faint placeholder:text-ink-faint/50 focus:outline-none"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Update title"
            className="flex-1 border-none bg-transparent font-display text-3xl text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description, shown on the changelog"
          rows={2}
          className="mt-4 w-full resize-none rounded-sm border border-line bg-paper-soft px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
        />

        <div className="mt-6 flex gap-1 border-b border-line">
          <button
            type="button"
            onClick={() => setView("write")}
            className={`px-3 py-2 text-sm ${view === "write" ? "border-b-2 border-ink text-ink" : "text-ink-faint"}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setView("preview")}
            className={`px-3 py-2 text-sm ${view === "preview" ? "border-b-2 border-ink text-ink" : "text-ink-faint"}`}
          >
            Preview
          </button>
        </div>

        <div className="mt-4">
          {view === "write" ? (
            <RichTextEditor content={contentHtml} onChange={setContentHtml} />
          ) : (
            <div className="rounded-sm border border-line bg-paper p-8">
              <div className="flex items-center gap-3">
                <p className="font-display text-xl text-ink-faint">{version || "v0.0"}</p>
                <UpdateTypeBadge type={type} />
              </div>
              <h1 className="mt-2 font-display text-3xl text-ink">
                {title || "Untitled update"}
              </h1>
              <p className="mt-3 text-xs text-ink-faint">
                {formatDate(new Date().toISOString())}
              </p>
              {coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImage}
                  alt=""
                  className="mt-6 aspect-[16/9] w-full rounded-sm border border-line object-cover"
                />
              )}
              <div
                className="journal-prose mt-6"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: previewHtml || "<p>Nothing written yet.</p>" }}
              />
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-sm border border-line bg-paper p-4">
          <p className="field-label">Status</p>
          <p className="mb-3 text-sm text-ink-soft">
            {status === "published" ? "Published — visible on the public site." : "Draft — hidden from the public site."}
          </p>
          {error && <p className="mb-3 text-sm text-accent-rust">{error}</p>}
          <div className="flex flex-col gap-2">
            {status === "published" ? (
              <>
                <button disabled={saving} onClick={() => save("published")} className="btn-primary">
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button
                  disabled={saving}
                  onClick={() => {
                    setStatus("draft");
                    save("draft");
                  }}
                  className="btn-secondary"
                >
                  Unpublish
                </button>
              </>
            ) : (
              <>
                <button disabled={saving} onClick={() => save("draft")} className="btn-secondary">
                  {saving ? "Saving…" : "Save draft"}
                </button>
                <button
                  disabled={saving || !version || !title || !description || !contentHtml}
                  onClick={() => {
                    setStatus("published");
                    save("published");
                  }}
                  className="btn-primary"
                >
                  Publish
                </button>
              </>
            )}
          </div>
          {isEditing && (
            <button
              onClick={remove}
              disabled={saving}
              className="mt-3 w-full text-center text-xs text-accent-rust hover:underline"
            >
              Delete update
            </button>
          )}
        </div>

        <div className="rounded-sm border border-line bg-paper p-4">
          <label className="field-label" htmlFor="type">
            Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="field-input"
          >
            {UPDATE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-sm border border-line bg-paper p-4">
          <CoverImagePicker value={coverImage} onChange={setCoverImage} />
        </div>
      </aside>
    </div>
  );
}
