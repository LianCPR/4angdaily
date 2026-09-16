import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { ArticlesRepo } from "@/lib/db";
import { articleSchema } from "@/lib/validation";
import { revalidateArticlePaths } from "@/lib/revalidate";

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const article = await ArticlesRepo.getById(id);
  if (!article)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ article });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid article" },
      { status: 400 }
    );
  }

  const previousSlug = (await ArticlesRepo.getById(id))?.slug;
  const article = await ArticlesRepo.update(id, parsed.data as any);
  if (!article)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  revalidateArticlePaths(article.slug, previousSlug);
  return NextResponse.json({ article });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (body?.status !== "draft" && body?.status !== "published") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const article = await ArticlesRepo.setStatus(id, body.status);
  if (!article)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  revalidateArticlePaths(article.slug);
  return NextResponse.json({ article });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const existing = await ArticlesRepo.getById(id);
  const ok = await ArticlesRepo.delete(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing) revalidateArticlePaths(existing.slug);
  return NextResponse.json({ ok: true });
}
