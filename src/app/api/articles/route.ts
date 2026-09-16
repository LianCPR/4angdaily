import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { ArticlesRepo } from "@/lib/db";
import { articleSchema } from "@/lib/validation";
import { revalidateArticlePaths } from "@/lib/revalidate";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ articles: await ArticlesRepo.listAll() });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid article" },
      { status: 400 }
    );
  }

  const article = await ArticlesRepo.create(parsed.data as any);
  revalidateArticlePaths(article.slug);
  return NextResponse.json({ article }, { status: 201 });
}
