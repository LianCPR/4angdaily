import Link from "next/link";
import { ArticlesRepo, UpdatesRepo } from "@/lib/db";
import { formatDate } from "@/lib/text";

export default async function AdminOverviewPage() {
  const [articles, updates] = await Promise.all([
    ArticlesRepo.listAll(),
    UpdatesRepo.listAll(),
  ]);

  const publishedArticles = articles.filter((a) => a.status === "published");
  const draftArticles = articles.filter((a) => a.status === "draft");
  const publishedUpdates = updates.filter((u) => u.status === "published");

  const recent = [...articles, ...updates]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 6);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Overview</h1>
      <p className="mt-1 text-sm text-ink-faint">
        A quick snapshot of the Journal.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total articles" value={articles.length} />
        <StatCard label="Published articles" value={publishedArticles.length} />
        <StatCard label="Drafts" value={draftArticles.length} />
        <StatCard label="Published updates" value={publishedUpdates.length} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <QuickAction
          href="/admin/articles/new"
          title="Write a new article"
          description="Start a Blog post with the editor."
        />
        <QuickAction
          href="/admin/updates/new"
          title="Log a new update"
          description="Publish a changelog entry."
        />
      </div>

      <div className="mt-10">
        <h2 className="mb-3 font-display text-xl text-ink">Recent activity</h2>
        <div className="overflow-hidden rounded-sm border border-line bg-paper">
          {recent.length === 0 ? (
            <p className="p-6 text-sm text-ink-faint">
              Nothing yet — create your first article or update.
            </p>
          ) : (
            recent.map((item) => {
              const isArticle = "category" in item;
              const href = isArticle
                ? `/admin/articles/${item.id}/edit`
                : `/admin/updates/${item.id}/edit`;
              return (
                <Link
                  key={`${isArticle ? "a" : "u"}-${item.id}`}
                  href={href}
                  className="flex items-center justify-between border-b border-line/70 px-5 py-3 text-sm last:border-none hover:bg-paper-soft"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        item.status === "published"
                          ? "bg-accent-moss/15 text-accent-moss"
                          : "bg-ink/10 text-ink-soft"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-ink">{item.title}</span>
                    <span className="text-xs text-ink-faint">
                      {isArticle ? "Article" : "Update"}
                    </span>
                  </span>
                  <span className="text-xs text-ink-faint">
                    {formatDate(item.updatedAt)}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-line bg-paper p-5">
      <p className="font-display text-3xl text-ink">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink-faint">
        {label}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-sm border border-line bg-paper p-5 transition-colors hover:border-ink"
    >
      <p className="font-display text-lg text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink-faint">{description}</p>
    </Link>
  );
}
