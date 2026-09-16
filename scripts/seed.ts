/**
 * Seeds a few realistic sample articles and updates so the UI has something
 * to show right after setup. Everything here is normal content — edit or
 * delete it from /admin like anything else. Run with: npm run seed
 */
import { ArticlesRepo, UpdatesRepo } from "../src/lib/db";

async function main() {
  const existingArticles = await ArticlesRepo.listAll();
  if (existingArticles.length === 0) {
    await ArticlesRepo.create({
      title: "Behind the Build",
      subtitle: "Why we started keeping a public journal for 4ANG.",
      description:
        "A short note on what this Journal is for, and what you can expect to find here as 4ANG keeps shipping.",
      category: "Behind 4ANG",
      tags: ["4ang", "journal", "behind-the-scenes"],
      author: "4ANG",
      status: "published",
      contentHtml: `
        <p>We wanted one place to write about the decisions behind 4ANG — not just the changelog, but the reasoning, the dead ends, and the small details that don't fit in a release note.</p>
        <h2>What you'll find here</h2>
        <p>Expect posts on product thinking, engineering notes, design decisions, and the occasional story from behind the scenes. Nothing here is written for search engines first — it's written because we wanted to write it down.</p>
        <blockquote>This is sample content — edit or delete it from the admin at any time.</blockquote>
        <h2>What's next</h2>
        <p>New posts show up here as they're written, and every product update gets logged on the Updates page. No newsletter, no algorithm — just a page you can check.</p>
      `,
    });

    await ArticlesRepo.create({
      title: "Designing the New 4ANG Experience",
      subtitle: "Notes from a redesign that started with a single question.",
      description:
        "How a small set of constraints shaped the visual direction of the current 4ANG interface.",
      category: "Design",
      tags: ["design", "product"],
      author: "4ANG",
      status: "published",
      contentHtml: `
        <p>Every redesign starts with a question worth answering. Ours was simple: what should 4ANG feel like to use every day, not just the first time?</p>
        <h2>Starting from constraints</h2>
        <p>Instead of a mood board, we started with a list of things the interface was <em>not</em> allowed to do — no dead ends, no unexplained states, no screen without a clear next step.</p>
        <h2>Where it landed</h2>
        <p>The result is calmer than what we started with, and slower to add to. That's the point — every new element has to earn its place.</p>
      `,
    });

    await ArticlesRepo.create({
      title: "Building Social Discovery",
      subtitle: "How recommendations travel through your circle, not around it.",
      description:
        "An early look at the engineering behind how people find new things through 4ANG.",
      category: "Engineering",
      tags: ["engineering", "discovery"],
      author: "4ANG",
      status: "published",
      coverImage: null,
      contentHtml: `
        <p>Most discovery systems optimize for what a stranger might like. We wanted to build something that optimizes for what the people you already trust are into.</p>
        <h2>The approach</h2>
        <p>Rather than a black-box ranking model, discovery here is built on visible, explainable signals — what your circle is engaging with, and why it surfaced.</p>
        <pre><code>// simplified scoring sketch
score = circleWeight * overlap + recency * decay</code></pre>
        <h2>Still early</h2>
        <p>This is an ongoing area of work, and it'll keep showing up in the Updates page as it evolves.</p>
      `,
    });
    console.log("Seeded 3 sample articles.");
  } else {
    console.log("Articles already exist — skipping article seed.");
  }

  const existingUpdates = await UpdatesRepo.listAll();
  if (existingUpdates.length === 0) {
    await UpdatesRepo.create({
      version: "v2.7",
      title: "Social Intelligence",
      description: "A new intelligence layer that surfaces what your circle is into.",
      type: "New",
      status: "published",
      contentHtml: `
        <h2>New</h2>
        <p>Social Intelligence is now available — a layer that surfaces recommendations based on your circle's activity rather than a generic feed.</p>
        <h2>Improved</h2>
        <p>Faster load times across the discovery surfaces.</p>
        <h2>Fixed</h2>
        <p>A handful of small display issues on narrower screens.</p>
      `,
    });

    await UpdatesRepo.create({
      version: "v2.6",
      title: "Artist Intelligence",
      description: "Deeper artist profiles with clearer context on why they're recommended.",
      type: "Improved",
      status: "published",
      contentHtml: `
        <h2>Improved</h2>
        <p>Artist pages now explain more clearly why something was recommended, instead of just showing that it was.</p>
        <h2>Fixed</h2>
        <p>Resolved an issue where some artist images failed to load on first visit.</p>
      `,
    });

    await UpdatesRepo.create({
      version: "v2.5",
      title: "Playlist Intelligence",
      description: "Smarter playlist suggestions that adapt as you listen.",
      type: "New",
      status: "published",
      contentHtml: `
        <h2>New</h2>
        <p>Playlist Intelligence rolls out today, adjusting suggested playlists as your listening changes over a session.</p>
        <h2>Changed</h2>
        <p>Simplified the playlist creation flow from four steps down to two.</p>
      `,
    });
    console.log("Seeded 3 sample updates.");
  } else {
    console.log("Updates already exist — skipping update seed.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
