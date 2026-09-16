"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Article, ContentStatus } from "@/lib/types";
import { BLOG_CATEGORIES } from "@/lib/types";
import { RichTextEditor } from "./RichTextEditor";
import { CoverImagePicker } from "./CoverImagePicker";
import { TagInput } from "./TagInput";
import { annotateHeadings, formatDate, readingTimeMinutes } from "@/lib/text";

export function ArticleForm({ initial }: { initial?: Article }) {
  const router = useRouter();
  const isEditing = Boolean(initial);

  const [title, setTitle] = useState(initial?.title || "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [category, setCategory] = useState(initial?.category || BLOG_CATEGORIES[0]);
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [coverImage, setCoverImage] = useState<string | null>(initial?.coverImage || null);
  const [author, setAuthor] = useState(initial?.author || "4ANG");
  const [contentHtml, setContentHtml] = useState(initial?.contentHtml || "");
  const [status, setStatus] = useState<ContentStatus>(initial?.status || "draft");
  const [view, setView] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(nextStatus: ContentStatus) {
    setSaving(true);
    setError(null);
    const payload = {
      title,
      subtitle,
      description,
      category,
      tags,
      coverImage,
      author,
      contentHtml,
      status: nextStatus,
    };

    try {
      const res = await fetch(
        isEditing ? `/api/articles/${initial!.id}` : "/api/articles",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save this article.");
        setSaving(false);
        return;
      }
      router.push("/admin/articles");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setSaving(false);
    }
  }

  async function remove() {
    if (!initial) return;
    if (!window.confirm(`Delete "${initial.title}"? This can't be undone.`)) return;
    setSaving(true);
    await fetch(`/api/articles/${initial.id}`, { method: "DELETE" });
    router.push("/admin/articles");
    router.refresh();
  }

  const { html: previewHtml } = annotateHeadings(contentHtml);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title"
          className="w-full border-none bg-transparent font-display text-3xl text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Subtitle (optional)"
          className="mt-2 w-full border-none bg-transparent font-display text-lg text-ink-soft placeholder:text-ink-faint focus:outline-none"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description, shown in cards and search results"
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
              <p className="eyebrow">{category}</p>
              <h1 className="mt-3 font-display text-3xl text-ink">
                {title || "Untitled article"}
              </h1>
              {subtitle && (
                <p className="mt-2 font-display text-lg text-ink-soft">{subtitle}</p>
              )}
              <p className="mt-3 text-xs text-ink-faint">
                {author} · {formatDate(new Date().toISOString())} ·{" "}
                {readingTimeMinutes(contentHtml)} min read
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
                  disabled={saving || !title || !description || !contentHtml}
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
              Delete article
            </button>
          )}
        </div>

        <div className="rounded-sm border border-line bg-paper p-4">
          <label className="field-label" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="field-input"
          >
            {BLOG_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="mt-4">
            <TagInput value={tags} onChange={setTags} />
          </div>

          <div className="mt-4">
            <label className="field-label" htmlFor="author">
              Author
            </label>
            <input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="field-input"
            />
          </div>
        </div>

        <div className="rounded-sm border border-line bg-paper p-4">
          <CoverImagePicker value={coverImage} onChange={setCoverImage} />
        </div>
      </aside>
    </div>
  );
}
