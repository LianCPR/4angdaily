import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { MediaRepo } from "@/lib/db";
import { deleteUpload } from "@/lib/storage";

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
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

  const media = await MediaRepo.getById(id);
  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteUpload(media);
  await MediaRepo.delete(id);

  return NextResponse.json({ ok: true });
}
