"use client";

export default function SiteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-journal flex flex-col items-center justify-center py-32 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-4 font-display text-3xl text-ink">
        We couldn&apos;t load this page
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        Give it another try, or head back to the Journal homepage.
      </p>
      <button onClick={() => reset()} className="btn-primary mt-8">
        Try again
      </button>
    </div>
  );
}
