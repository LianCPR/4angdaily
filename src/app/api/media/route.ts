import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { MediaRepo } from "@/lib/db";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  saveUpload,
} from "@/lib/storage";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ media: await MediaRepo.list() });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported image format. Use JPEG, PNG, WebP, GIF, or AVIF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Image is too large. Max size is 10MB." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { filename, url } = await saveUpload(buffer, file.name, file.type);

  const media = await MediaRepo.create({
    filename,
    url,
    originalName: file.name,
    size: file.size,
    mimeType: file.type,
  });

  return NextResponse.json({ media }, { status: 201 });
}
