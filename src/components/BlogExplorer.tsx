"use client";

import { useMemo, useState } from "react";
import type { Article } from "@/lib/types";
import { BLOG_CATEGORIES } from "@/lib/types";
import { ArticleCard } from "./ArticleCard";

export function BlogExplorer({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (category && a.category !== category) return false;
      if (!q) return true;
      const haystack = [a.title, a.description, a.category, ...a.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [articles, query, category]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            aria-label="Search articles"
            className="field-input"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory(null)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              category === null
                ? "border-ink bg-ink text-paper-soft"
                : "border-line text-ink-soft hover:border-ink"
            }`}
          >
            All
          </button>
          {BLOG_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c === category ? null : c)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                category === c
                  ? "border-ink bg-ink text-paper-soft"
                  : "border-line text-ink-soft hover:border-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-sm border border-dashed border-line py-20 text-center">
          <p className="font-display text-xl text-ink">No articles found</p>
          <p className="mt-2 text-sm text-ink-faint">
            Try a different search term or category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article, i) => (
            <ArticleCard key={article.id} article={article} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
