import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UpdatesRepo } from "@/lib/db";
import { annotateHeadings, formatDate } from "@/lib/text";
import { UpdateTypeBadge } from "@/components/UpdateRow";
import { Reveal } from "@/components/Reveal";

export async function generateStaticParams() {
  const updates = await UpdatesRepo.listPublished();
  return updates.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const update = await UpdatesRepo.getBySlug(slug);
  if (!update) return { title: "Update not found" };

  return {
    title: `${update.version} — ${update.title}`,
    description: update.description,
    alternates: { canonical: `/updates/${update.slug}` },
    openGraph: {
      title: `${update.version} — ${update.title}`,
      description: update.description,
      type: "article",
      publishedTime: update.publishedAt || undefined,
      images: update.coverImage ? [update.coverImage] : undefined,
      url: `/updates/${update.slug}`,
    },
  };
}

export default async function UpdateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const update = await UpdatesRepo.getBySlug(slug);
  if (!update) notFound();

  const { html } = annotateHeadings(update.contentHtml);
  const related = await UpdatesRepo.related(update, 3);

  return (
    <article className="py-14">
      <header className="container-journal max-w-3xl">
        <Reveal>
          <Link
            href="/updates"
            className="text-sm text-ink-faint transition-colors hover:text-ink"
          >
            ← All updates
          </Link>
          <div className="mt-5 flex items-center gap-3">
            <p className="font-display text-2xl text-ink-faint">
              {update.version}
            </p>
            <UpdateTypeBadge type={update.type} />
          </div>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
            {update.title}
          </h1>
          <p className="mt-4 text-lg text-ink-soft">{update.description}</p>
          <p className="mt-6 text-sm text-ink-faint">
            {formatDate(update.publishedAt)}
          </p>
        </Reveal>
      </header>

      {update.coverImage && (
        <Reveal className="container-journal mt-10 max-w-4xl">
          <div className="overflow-hidden rounded-sm border border-line shadow-lift">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={update.coverImage}
              alt=""
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        </Reveal>
      )}

      <div className="container-journal mt-12 max-w-3xl">
        <div
          className="journal-prose"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {related.length > 0 && (
        <section className="container-journal mt-16 max-w-3xl border-t border-line/70 pt-10">
          <p className="eyebrow mb-2">More updates</p>
          <div>
            {related.map((u) => (
              <Link
                key={u.id}
                href={`/updates/${u.slug}`}
                className="group flex items-center justify-between border-b border-line/70 py-4 last:border-none"
              >
                <span>
                  <span className="mr-3 font-display text-ink-faint">
                    {u.version}
                  </span>
                  <span className="text-ink group-hover:text-accent-rust transition-colors">
                    {u.title}
                  </span>
                </span>
                <span className="text-sm text-ink-faint">
                  {formatDate(u.publishedAt)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
