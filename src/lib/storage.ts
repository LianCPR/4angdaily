import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { put, del } from "@vercel/blob";

// Media storage adapter. Two modes, chosen automatically:
//  - BLOB_READ_WRITE_TOKEN set (Vercel deployments with a Blob store attached)
//    -> uploads go to Vercel Blob, which persists across deploys/cold starts.
//  - not set (local dev, or a host with a real persistent disk)
//    -> uploads are written to public/uploads on the local filesystem.
// Every call site only touches saveUpload()/deleteUpload() below, so this is
// the one place that would need to change to add another provider (S3, etc).

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

function extensionFor(mimeType: string, originalName: string): string {
  const fromName = path.extname(originalName);
  if (fromName) return fromName;
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  };
  return map[mimeType] || "";
}

function shouldUseBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function saveUpload(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ filename: string; url: string }> {
  const ext = extensionFor(mimeType, originalName);
  const key = `journal/${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

  if (shouldUseBlob()) {
    const blob = await put(key, buffer, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: false,
    });
    return { filename: blob.pathname, url: blob.url };
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = path.basename(key);
  // Local-disk fallback only (dev / non-serverless hosts) — Vercel deploys
  // use the Blob branch above. Ignored by Turbopack's build-time tracing so
  // it doesn't pull the whole project (incl. public/) into the server bundle.
  const fullPath = path.join(/* turbopackIgnore: true */ UPLOAD_DIR, filename);
  await fs.writeFile(fullPath, buffer);
  return { filename, url: `/uploads/${filename}` };
}

export async function deleteUpload(item: { filename: string; url: string }): Promise<void> {
  if (shouldUseBlob()) {
    try {
      await del(item.url);
    } catch {
      // already gone — nothing to do
    }
    return;
  }

  const fullPath = path.join(/* turbopackIgnore: true */ UPLOAD_DIR, item.filename);
  try {
    await fs.unlink(fullPath);
  } catch {
    // already gone — nothing to do
  }
}
