"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/media", label: "Media" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-56 shrink-0 border-r border-line/70 bg-paper px-4 py-8 sm:block">
      <p className="px-2 font-display text-lg text-ink">4ANG Journal</p>
      <p className="mb-8 px-2 text-xs uppercase tracking-wide text-ink-faint">
        Admin
      </p>
      <nav className="space-y-1">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-sm px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-ink text-paper-soft"
                  : "text-ink-soft hover:bg-paper-deep"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-10 space-y-1 border-t border-line/70 pt-4">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="block rounded-sm px-3 py-2 text-sm text-ink-soft hover:bg-paper-deep"
        >
          View site ↗
        </a>
        <button
          onClick={logout}
          className="block w-full rounded-sm px-3 py-2 text-left text-sm text-ink-soft hover:bg-paper-deep"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function MobileAdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="sticky top-0 z-30 border-b border-line/70 bg-paper sm:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-display text-base text-ink">4ANG Journal</span>
        <button onClick={logout} className="text-xs text-ink-faint">
          Sign out
        </button>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 text-sm">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 ${
                active
                  ? "bg-ink text-paper-soft"
                  : "border border-line text-ink-soft"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
