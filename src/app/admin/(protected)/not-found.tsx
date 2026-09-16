import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="rounded-sm border border-dashed border-line bg-paper p-10 text-center">
      <p className="font-display text-xl text-ink">Not found</p>
      <p className="mt-2 text-sm text-ink-faint">
        That item doesn&apos;t exist or was already deleted.
      </p>
      <Link href="/admin" className="btn-primary mt-4 inline-flex">
        Back to dashboard
      </Link>
    </div>
  );
}
