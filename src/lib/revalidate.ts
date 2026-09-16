import { revalidatePath } from "next/cache";

/** Call after any article create/update/status-change/delete. */
export function revalidateArticlePaths(slug: string, previousSlug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blog/${previousSlug}`);
  }
}

/** Call after any update-entry create/update/status-change/delete. */
export function revalidateUpdatePaths(slug: string, previousSlug?: string) {
  revalidatePath("/");
  revalidatePath("/updates");
  revalidatePath(`/updates/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/updates/${previousSlug}`);
  }
}
