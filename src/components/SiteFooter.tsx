import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line/70">
      <div className="container-journal flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-lg text-ink">4ANG Journal</p>
          <p className="mt-1 text-sm text-ink-faint">
            Stories, updates and everything behind 4ANG.
          </p>
        </div>
        <nav className="flex items-center gap-6 text-sm text-ink-soft">
          <Link href="/blog" className="hover:text-ink">
            Blog
          </Link>
          <Link href="/updates" className="hover:text-ink">
            Updates
          </Link>
          <a href="https://4ang.app" className="hover:text-ink">
            4ANG
          </a>
        </nav>
      </div>
      <div className="border-t border-line/70 py-5">
        <p className="container-journal text-xs text-ink-faint">
          © {new Date().getFullYear()} 4ANG. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
