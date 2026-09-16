export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Strips HTML tags to plain text, for word counting / excerpts. */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const WORDS_PER_MINUTE = 220;

export function readingTimeMinutes(html: string): number {
  const words = htmlToText(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function excerpt(html: string, maxLength = 180): string {
  const text = htmlToText(html);
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatMonthYear(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Walks h2/h3 tags in the article HTML, gives each a stable slug id (for
 * anchor links + table of contents), and returns the outline alongside the
 * annotated HTML.
 */
export function annotateHeadings(html: string): {
  html: string;
  headings: Heading[];
} {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();

  const annotated = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_match, levelStr, attrs, inner) => {
      const level = Number(levelStr) as 2 | 3;
      const text = htmlToText(inner);
      let id = slugify(text) || `section`;
      const count = seen.get(id) || 0;
      seen.set(id, count + 1);
      if (count > 0) id = `${id}-${count + 1}`;

      headings.push({ id, text, level });
      const hasId = /\bid=/.test(attrs);
      const newAttrs = hasId ? attrs : `${attrs} id="${id}"`;
      return `<h${level}${newAttrs}>${inner}</h${level}>`;
    }
  );

  return { html: annotated, headings };
}
