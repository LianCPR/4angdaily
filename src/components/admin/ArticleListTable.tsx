"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Article } from "@/lib/types";
import { formatDate } from "@/lib/text";

export function ArticleListTable({ articles }: { articles: Article[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);

  async function toggleStatus(article: Article) {
    setBusyId(article.id);
    const nextStatus = article.status === "published" ? "draft" : "published";
    await fetch(`/api/articles/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function remove(article: Article) {
    if (!window.confirm(`Delete "${article.title}"? This can't be undone.`)) return;
    setBusyId(article.id);
    await fetch(`/api/articles/${article.id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line bg-paper p-10 text-center">
        <p className="text-sm text-ink-faint">No articles yet.</p>
        <Link href="/admin/articles/new" className="btn-primary mt-4 inline-flex">
          Write your first article
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-line bg-paper">
      {articles.map((a) => (
        <div
          key={a.id}
          className="flex flex-col gap-2 border-b border-line/70 px-5 py-4 last:border-none sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  a.status === "published"
                    ? "bg-accent-moss/15 text-accent-moss"
                    : "bg-ink/10 text-ink-soft"
                }`}
              >
                {a.status}
              </span>
              <p className="truncate font-medium text-ink">{a.title}</p>
            </div>
            <p className="mt-0.5 text-xs text-ink-faint">
              {a.category} · {formatDate(a.updatedAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm">
            <Link href={`/admin/articles/${a.id}/edit`} className="btn-secondary px-3 py-1.5 text-xs">
              Edit
            </Link>
            <button
              disabled={busyId === a.id}
              onClick={() => toggleStatus(a)}
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              {a.status === "published" ? "Unpublish" : "Publish"}
            </button>
            <button
              disabled={busyId === a.id}
              onClick={() => remove(a)}
              className="px-3 py-1.5 text-xs text-accent-rust hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
