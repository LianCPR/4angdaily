import type { Metadata } from "next";
import { ArticlesRepo } from "@/lib/db";
import { BlogExplorer } from "@/components/BlogExplorer";

export const metadata: Metadata = {
  title: "Blog",
  description: "Stories, product thinking and engineering notes from 4ANG.",
};

export default async function BlogPage() {
  const articles = await ArticlesRepo.listPublished();

  return (
    <div className="container-journal py-14">
      <p className="eyebrow">Blog</p>
      <h1 className="mt-3 max-w-xl font-display text-4xl text-ink">
        Stories, product thinking and notes from behind 4ANG.
      </h1>
      <div className="mt-10">
        <BlogExplorer articles={articles} />
      </div>
    </div>
  );
}
