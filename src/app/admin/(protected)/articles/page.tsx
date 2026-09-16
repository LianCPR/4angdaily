import Link from "next/link";
import { ArticlesRepo } from "@/lib/db";
import { ArticleListTable } from "@/components/admin/ArticleListTable";

export default async function AdminArticlesPage() {
  const articles = await ArticlesRepo.listAll();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Articles</h1>
          <p className="mt-1 text-sm text-ink-faint">{articles.length} total</p>
        </div>
        <Link href="/admin/articles/new" className="btn-primary">
          New article
        </Link>
      </div>
      <div className="mt-6">
        <ArticleListTable articles={articles} />
      </div>
    </div>
  );
}
