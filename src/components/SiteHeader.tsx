"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // transparent only applies on the home hero — isHome already gates this,
  // so `scrolled`'s value on other pages is irrelevant.
  const transparent = isHome && !scrolled;

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-500 ${
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-line/70 bg-paper/85 backdrop-blur-md"
      }`}
    >
      <div className="container-journal flex h-16 items-center justify-between">
        <Link
          href="/"
          className={`font-display text-lg tracking-wide transition-opacity hover:opacity-70 ${
            transparent ? "text-paper-soft" : "text-ink"
          }`}
        >
          4ANG{" "}
          <span className={transparent ? "text-[#E7C9A9]" : "text-accent-rust"}>
            Journal
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/blog"
            className={transparent ? "btn-ghost !text-paper-soft/85 hover:!text-paper-soft" : "btn-ghost"}
          >
            Blog
          </Link>
          <Link
            href="/updates"
            className={transparent ? "btn-ghost !text-paper-soft/85 hover:!text-paper-soft" : "btn-ghost"}
          >
            Updates
          </Link>
          <a
            href="https://4ang.app"
            className={`ml-2 hidden sm:inline-flex ${
              transparent ? "btn-secondary !border-paper-soft/40 !text-paper-soft hover:!border-paper-soft" : "btn-secondary"
            }`}
          >
            Back to 4ANG
          </a>
        </nav>
      </div>
    </header>
  );
}
