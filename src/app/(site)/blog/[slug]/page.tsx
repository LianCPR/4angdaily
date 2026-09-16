import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticlesRepo } from "@/lib/db";
import { annotateHeadings, formatDate } from "@/lib/text";
import { ReadingProgress } from "@/components/ReadingProgress";
import { TableOfContents } from "@/components/TableOfContents";
import { ArticleCard } from "@/components/ArticleCard";
import { Reveal } from "@/components/Reveal";

export async function generateStaticParams() {
  const articles = await ArticlesRepo.listPublished();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await ArticlesRepo.getBySlug(slug);
  if (!article) return { title: "Article not found" };

  const ogImage = article.coverImage ? [article.coverImage] : undefined;

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt || undefined,
      images: ogImage,
      url: `/blog/${article.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: ogImage,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await ArticlesRepo.getBySlug(slug);
  if (!article) notFound();

  const { html, headings } = annotateHeadings(article.contentHtml);
  const related = await ArticlesRepo.related(article, 3);

  const published = await ArticlesRepo.listPublished();
  const idx = published.findIndex((a) => a.id === article.id);
  const prev = idx >= 0 ? published[idx + 1] : undefined;
  const next = idx > 0 ? published[idx - 1] : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: article.author },
    image: article.coverImage || undefined,
  };

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="py-14">
        <header className="container-journal max-w-3xl">
          <Reveal>
            <p className="eyebrow">{article.category}</p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {article.title}
            </h1>
            {article.subtitle && (
              <p className="mt-4 font-display text-xl text-ink-soft">
                {article.subtitle}
              </p>
            )}
            <div className="mt-6 flex items-center gap-2 text-sm text-ink-faint">
              <span className="font-medium text-ink-soft">
                {article.author}
              </span>
              <span aria-hidden>·</span>
              <span>{formatDate(article.publishedAt)}</span>
              <span aria-hidden>·</span>
              <span>{article.readingTimeMinutes} min read</span>
            </div>
          </Reveal>
        </header>

        {article.coverImage && (
          <Reveal className="container-journal mt-10 max-w-5xl">
            <div className="animate-reveal overflow-hidden rounded-sm border border-line shadow-lift">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImage}
                alt=""
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </Reveal>
        )}

        <div className="container-journal mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_240px]">
          <div className="max-w-3xl">
            <div
              className="journal-prose"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {article.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-line/70 pt-6">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {(prev || next) && (
              <nav className="mt-12 grid grid-cols-1 gap-4 border-t border-line/70 pt-8 sm:grid-cols-2">
                {prev ? (
                  <Link
                    href={`/blog/${prev.slug}`}
                    className="group rounded-sm border border-line p-4 transition-colors hover:border-ink"
                  >
                    <p className="text-xs uppercase tracking-wide text-ink-faint">
                      ← Previous
                    </p>
                    <p className="mt-1 font-display text-lg text-ink group-hover:text-accent-rust">
                      {prev.title}
                    </p>
                  </Link>
                ) : (
                  <div />
                )}
                {next && (
                  <Link
                    href={`/blog/${next.slug}`}
                    className="group rounded-sm border border-line p-4 text-right transition-colors hover:border-ink"
                  >
                    <p className="text-xs uppercase tracking-wide text-ink-faint">
                      Next →
                    </p>
                    <p className="mt-1 font-display text-lg text-ink group-hover:text-accent-rust">
                      {next.title}
                    </p>
                  </Link>
                )}
              </nav>
            )}
          </div>

          <TableOfContents headings={headings} />
        </div>

        {related.length > 0 && (
          <section className="container-journal mt-20 border-t border-line/70 pt-12">
            <p className="eyebrow mb-6">You may also like</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
