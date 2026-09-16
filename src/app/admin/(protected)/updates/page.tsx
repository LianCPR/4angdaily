import Link from "next/link";
import { UpdatesRepo } from "@/lib/db";
import { UpdateListTable } from "@/components/admin/UpdateListTable";

export default async function AdminUpdatesPage() {
  const updates = await UpdatesRepo.listAll();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Updates</h1>
          <p className="mt-1 text-sm text-ink-faint">{updates.length} total</p>
        </div>
        <Link href="/admin/updates/new" className="btn-primary">
          New update
        </Link>
      </div>
      <div className="mt-6">
        <UpdateListTable updates={updates} />
      </div>
    </div>
  );
}
