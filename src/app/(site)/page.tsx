import Link from "next/link";
import { ArticlesRepo, UpdatesRepo } from "@/lib/db";
import { ArticleCard } from "@/components/ArticleCard";
import { UpdateRow } from "@/components/UpdateRow";
import { Reveal } from "@/components/Reveal";
import { CinematicHero } from "@/components/CinematicHero";

export default async function HomePage() {
  const [articles, updates] = await Promise.all([
    ArticlesRepo.listPublished(),
    UpdatesRepo.listPublished(),
  ]);

  const [featured, ...rest] = articles;
  const latestArticles = rest.slice(0, 3);
  const latestUpdates = updates.slice(0, 3);

  return (
    <>
      <CinematicHero featured={featured} />

      <section className="py-16 sm:py-20">
        <div className="container-journal">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-2xl text-ink">Latest Blog</h2>
            <Link
              href="/blog"
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              View all →
            </Link>
          </div>
          {latestArticles.length === 0 ? (
            <EmptyState label="No articles published yet." />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {latestArticles.map((a) => (
                <Reveal key={a.id}>
                  <ArticleCard article={a} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-line/70 bg-paper-soft/60 py-16 sm:py-20">
        <div className="container-journal">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl text-ink">Latest Updates</h2>
            <Link
              href="/updates"
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              View all →
            </Link>
          </div>
          {latestUpdates.length === 0 ? (
            <EmptyState label="No updates published yet." />
          ) : (
            <div>
              {latestUpdates.map((u) => (
                <UpdateRow key={u.id} update={u} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-sm border border-dashed border-line py-14 text-center text-sm text-ink-faint">
      {label}
    </div>
  );
}
