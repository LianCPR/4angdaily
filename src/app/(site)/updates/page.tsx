import type { Metadata } from "next";
import { UpdatesRepo } from "@/lib/db";
import { UpdateRow } from "@/components/UpdateRow";
import { formatMonthYear } from "@/lib/text";
import type { UpdateEntry } from "@/lib/types";

export const metadata: Metadata = {
  title: "Updates",
  description: "A changelog of everything shipping in 4ANG.",
};

function groupByMonth(updates: UpdateEntry[]) {
  const groups = new Map<string, UpdateEntry[]>();
  for (const u of updates) {
    if (!u.publishedAt) continue;
    const key = formatMonthYear(u.publishedAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(u);
  }
  return Array.from(groups.entries());
}

export default async function UpdatesPage() {
  const updates = await UpdatesRepo.listPublished();
  const groups = groupByMonth(updates);

  return (
    <div className="container-journal py-14">
      <p className="eyebrow">Updates</p>
      <h1 className="mt-3 max-w-xl font-display text-4xl text-ink">
        Everything shipping in 4ANG, as it happens.
      </h1>

      <div className="mt-12">
        {groups.length === 0 ? (
          <div className="rounded-sm border border-dashed border-line py-20 text-center text-sm text-ink-faint">
            No updates published yet.
          </div>
        ) : (
          groups.map(([month, items]) => (
            <div key={month} className="mb-4">
              <h2 className="mb-2 font-display text-lg text-ink-faint">
                {month}
              </h2>
              <div>
                {items.map((u) => (
                  <UpdateRow key={u.id} update={u} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
