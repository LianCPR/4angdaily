import Link from "next/link";
import type { UpdateEntry } from "@/lib/types";
import { formatDate } from "@/lib/text";

const TYPE_STYLES: Record<string, string> = {
  New: "bg-accent-moss/15 text-accent-moss",
  Improved: "bg-accent-gold/15 text-accent-gold",
  Fixed: "bg-ink/10 text-ink-soft",
  Changed: "bg-accent-rust/15 text-accent-rust",
  Removed: "bg-ink-faint/15 text-ink-faint",
};

const DOT_STYLES: Record<string, string> = {
  New: "bg-accent-moss",
  Improved: "bg-accent-gold",
  Fixed: "bg-ink-faint",
  Changed: "bg-accent-rust",
  Removed: "bg-ink-faint",
};

export function UpdateTypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        TYPE_STYLES[type] || "bg-ink/10 text-ink-soft"
      }`}
    >
      {type}
    </span>
  );
}

export function UpdateRow({ update }: { update: UpdateEntry }) {
  return (
    <Link
      href={`/updates/${update.slug}`}
      className="group relative grid grid-cols-1 gap-3 border-b border-line/70 py-7 pl-6 transition-colors last:border-none hover:bg-paper-soft/60 sm:grid-cols-[110px_1fr_auto] sm:items-start sm:gap-6 sm:px-4 sm:pl-10"
    >
      <span
        className={`absolute left-0 top-9 h-2.5 w-2.5 -translate-x-1/2 rounded-full ring-4 ring-paper transition-transform group-hover:scale-125 sm:left-4 ${
          DOT_STYLES[update.type] || "bg-ink-faint"
        }`}
        aria-hidden
      />
      <span className="absolute left-0 top-0 h-full w-px bg-line sm:left-4" aria-hidden />

      <p className="font-display text-lg text-ink-faint">{update.version}</p>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <UpdateTypeBadge type={update.type} />
          <h3 className="font-display text-xl text-ink transition-colors group-hover:text-accent-rust">
            {update.title}
          </h3>
        </div>
        <p className="mt-2 text-sm text-ink-soft">{update.description}</p>
      </div>
      <p className="text-sm text-ink-faint sm:text-right">
        {formatDate(update.publishedAt)}
      </p>
    </Link>
  );
}
