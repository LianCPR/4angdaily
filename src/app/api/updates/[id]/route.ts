import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { UpdatesRepo } from "@/lib/db";
import { updateSchema } from "@/lib/validation";
import { revalidateUpdatePaths } from "@/lib/revalidate";

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

  const entry = await UpdatesRepo.getById(id);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ update: entry });
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
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid update" },
      { status: 400 }
    );
  }

  const previousSlug = (await UpdatesRepo.getById(id))?.slug;
  const entry = await UpdatesRepo.update(id, parsed.data as any);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  revalidateUpdatePaths(entry.slug, previousSlug);
  return NextResponse.json({ update: entry });
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

  const entry = await UpdatesRepo.setStatus(id, body.status);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  revalidateUpdatePaths(entry.slug);
  return NextResponse.json({ update: entry });
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

  const existing = await UpdatesRepo.getById(id);
  const ok = await UpdatesRepo.delete(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing) revalidateUpdatePaths(existing.slug);
  return NextResponse.json({ ok: true });
}
