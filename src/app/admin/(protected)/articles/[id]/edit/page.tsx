import { notFound } from "next/navigation";
import { ArticlesRepo } from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await ArticlesRepo.getById(Number(id));
  if (!article) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Edit article</h1>
      <div className="mt-6">
        <ArticleForm initial={article} />
      </div>
    </div>
  );
}
