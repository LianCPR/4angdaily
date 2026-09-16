import { ArticleForm } from "@/components/admin/ArticleForm";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink">New article</h1>
      <div className="mt-6">
        <ArticleForm />
      </div>
    </div>
  );
}
