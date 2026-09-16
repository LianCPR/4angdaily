import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-journal flex flex-col items-center justify-center py-32 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-display text-4xl text-ink">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        The article or update you&apos;re looking for may have been moved,
        unpublished, or never existed.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary">
          Back to Journal
        </Link>
        <Link href="/blog" className="btn-secondary">
          Browse Blog
        </Link>
      </div>
    </div>
  );
}
