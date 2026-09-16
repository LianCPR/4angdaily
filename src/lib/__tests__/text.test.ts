import { describe, expect, it } from "vitest";
import { slugify, readingTimeMinutes, excerpt, annotateHeadings } from "../text";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Social Discovery 2.0")).toBe("social-discovery-20");
  });

  it("strips accents", () => {
    expect(slugify("Café Résumé")).toBe("cafe-resume");
  });

  it("collapses repeated separators", () => {
    expect(slugify("  hello   world!! ")).toBe("hello-world");
  });
});

describe("readingTimeMinutes", () => {
  it("returns at least 1 minute for short content", () => {
    expect(readingTimeMinutes("<p>Hello</p>")).toBe(1);
  });

  it("scales with word count", () => {
    const longHtml = `<p>${"word ".repeat(1000)}</p>`;
    expect(readingTimeMinutes(longHtml)).toBeGreaterThan(3);
  });
});

describe("excerpt", () => {
  it("truncates long text on a word boundary", () => {
    const html = `<p>${"lorem ".repeat(60)}</p>`;
    const result = excerpt(html, 50);
    expect(result.length).toBeLessThanOrEqual(51);
    expect(result.endsWith("…")).toBe(true);
  });

  it("returns short text unchanged", () => {
    expect(excerpt("<p>Short</p>", 100)).toBe("Short");
  });
});

describe("annotateHeadings", () => {
  it("assigns ids to h2/h3 and extracts an outline", () => {
    const html = "<h2>The Problem</h2><p>Text</p><h3>A Detail</h3>";
    const { html: annotated, headings } = annotateHeadings(html);
    expect(headings).toEqual([
      { id: "the-problem", text: "The Problem", level: 2 },
      { id: "a-detail", text: "A Detail", level: 3 },
    ]);
    expect(annotated).toContain('id="the-problem"');
    expect(annotated).toContain('id="a-detail"');
  });

  it("de-duplicates repeated heading text", () => {
    const html = "<h2>Intro</h2><h2>Intro</h2>";
    const { headings } = annotateHeadings(html);
    expect(headings.map((h) => h.id)).toEqual(["intro", "intro-2"]);
  });
});
