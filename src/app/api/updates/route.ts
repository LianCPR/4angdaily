import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { UpdatesRepo } from "@/lib/db";
import { updateSchema } from "@/lib/validation";
import { revalidateUpdatePaths } from "@/lib/revalidate";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ updates: await UpdatesRepo.listAll() });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid update" },
      { status: 400 }
    );
  }

  const entry = await UpdatesRepo.create(parsed.data as any);
  revalidateUpdatePaths(entry.slug);
  return NextResponse.json({ update: entry }, { status: 201 });
}
