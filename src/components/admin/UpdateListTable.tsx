"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UpdateEntry } from "@/lib/types";
import { formatDate } from "@/lib/text";
import { UpdateTypeBadge } from "../UpdateRow";

export function UpdateListTable({ updates }: { updates: UpdateEntry[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);

  async function toggleStatus(entry: UpdateEntry) {
    setBusyId(entry.id);
    const nextStatus = entry.status === "published" ? "draft" : "published";
    await fetch(`/api/updates/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function remove(entry: UpdateEntry) {
    if (!window.confirm(`Delete "${entry.version} — ${entry.title}"? This can't be undone.`)) return;
    setBusyId(entry.id);
    await fetch(`/api/updates/${entry.id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  if (updates.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line bg-paper p-10 text-center">
        <p className="text-sm text-ink-faint">No updates yet.</p>
        <Link href="/admin/updates/new" className="btn-primary mt-4 inline-flex">
          Log your first update
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-line bg-paper">
      {updates.map((u) => (
        <div
          key={u.id}
          className="flex flex-col gap-2 border-b border-line/70 px-5 py-4 last:border-none sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  u.status === "published"
                    ? "bg-accent-moss/15 text-accent-moss"
                    : "bg-ink/10 text-ink-soft"
                }`}
              >
                {u.status}
              </span>
              <span className="font-display text-sm text-ink-faint">{u.version}</span>
              <UpdateTypeBadge type={u.type} />
              <p className="truncate font-medium text-ink">{u.title}</p>
            </div>
            <p className="mt-0.5 text-xs text-ink-faint">{formatDate(u.updatedAt)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm">
            <Link href={`/admin/updates/${u.id}/edit`} className="btn-secondary px-3 py-1.5 text-xs">
              Edit
            </Link>
            <button
              disabled={busyId === u.id}
              onClick={() => toggleStatus(u)}
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              {u.status === "published" ? "Unpublish" : "Publish"}
            </button>
            <button
              disabled={busyId === u.id}
              onClick={() => remove(u)}
              className="px-3 py-1.5 text-xs text-accent-rust hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
