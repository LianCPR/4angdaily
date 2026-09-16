import Link from "next/link";
import type { Article } from "@/lib/types";
import { formatDate } from "@/lib/text";

export function CinematicHero({ featured }: { featured?: Article }) {
  const hasImage = Boolean(featured?.coverImage);

  return (
    <section className="relative overflow-hidden border-b border-line/70">
      <div className="relative flex min-h-[78vh] flex-col justify-end sm:min-h-[86vh]">
        {/* Backdrop */}
        <div className="absolute inset-0 -z-10">
          {hasImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featured!.coverImage!}
                alt=""
                className="h-full w-full scale-[1.03] object-cover motion-safe:animate-kenburns"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
              <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-transparent" />
            </>
          ) : (
            <div className="h-full w-full bg-[radial-gradient(120%_120%_at_15%_0%,#3a2f26_0%,#241d18_45%,#171310_100%)]" />
          )}
          <div className="absolute inset-0 bg-grain opacity-[0.15] mix-blend-overlay" />
        </div>

        {/* Top nav spacer content */}
        <div className="container-journal relative pb-14 pt-28 sm:pb-20 sm:pt-36">
          <p className="eyebrow text-[#E7C9A9]">4ANG Journal</p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.06] text-paper-soft sm:text-7xl">
            Stories, updates and
            <br className="hidden sm:block" /> everything behind 4ANG.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-paper-soft/75">
            A newsroom for what we&apos;re building, why we&apos;re building
            it, and what changes along the way.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/blog" className="btn-primary !border-paper-soft !bg-paper-soft !text-ink hover:!bg-paper">
              Read the Blog
            </Link>
            <Link
              href="/updates"
              className="btn-secondary !border-paper-soft/40 !text-paper-soft hover:!border-paper-soft"
            >
              View Updates
            </Link>
            <a href="https://4ang.app" className="btn-ghost !text-paper-soft/70 hover:!text-paper-soft">
              Back to 4ANG →
            </a>
          </div>

          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group mt-14 flex max-w-2xl flex-col gap-2 border-t border-paper-soft/20 pt-6 sm:mt-20"
            >
              <span className="eyebrow text-[#E7C9A9]">
                Featured · {featured.category}
              </span>
              <span className="font-display text-2xl leading-snug text-paper-soft transition-colors group-hover:text-[#E7C9A9] sm:text-3xl">
                {featured.title}
              </span>
              <span className="flex items-center gap-2 text-sm text-paper-soft/60">
                <span>{formatDate(featured.publishedAt)}</span>
                <span aria-hidden>·</span>
                <span>{featured.readingTimeMinutes} min read</span>
                <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
