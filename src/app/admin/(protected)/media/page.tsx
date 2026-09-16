import { MediaRepo } from "@/lib/db";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export default async function AdminMediaPage() {
  const media = await MediaRepo.list();

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Media</h1>
      <p className="mt-1 text-sm text-ink-faint">
        Images used across articles and updates.
      </p>
      <div className="mt-6">
        <MediaLibrary media={media} />
      </div>
    </div>
  );
}
