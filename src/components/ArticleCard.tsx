import Link from "next/link";
import type { Article } from "@/lib/types";
import { formatDate } from "@/lib/text";

export function ArticleCard({
  article,
  priority = false,
}: {
  article: Article;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="card-lift group block overflow-hidden rounded-sm border border-line bg-paper-soft shadow-paper"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-paper-deep">
        {article.coverImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImage}
              alt=""
              loading={priority ? "eager" : "lazy"}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-3xl text-ink-faint/40">
            4ANG
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-paper-soft/40 bg-ink/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-paper-soft backdrop-blur-sm">
          {article.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl leading-snug text-ink transition-colors group-hover:text-accent-rust">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
          {article.description}
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-ink-faint">
          <span>{formatDate(article.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span>{article.readingTimeMinutes} min read</span>
        </div>
      </div>
    </Link>
  );
}
