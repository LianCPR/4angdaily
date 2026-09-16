# 4ANG Journal

An independent editorial website for 4ANG Blog articles and Product Updates,
with its own admin CMS. Fully standalone — no dependency on the main 4ANG
codebase, database, or auth. Built to deploy cleanly on Vercel (or any Node
host) with persistent data.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS
- **Turso (libSQL)** for the database — SQLite-compatible, serverless-friendly,
  persists across deploys. Falls back to a local SQLite file automatically
  when no Turso credentials are set, so local dev needs zero external setup.
- **Vercel Blob** for uploaded images — persists across deploys. Falls back to
  local disk (`public/uploads`) automatically when not configured.
- **Tiptap** for the admin rich-text editor
- Custom signed-cookie session auth for `/admin` (no auth library dependency)

## Getting started (local dev)

```bash
npm install
cp .env.example .env.local   # edit ADMIN_USERNAME / ADMIN_PASSWORD / SESSION_SECRET
npm run seed                 # optional: adds sample articles & updates
npm run dev
```

Visit `http://localhost:3000` for the public site and
`http://localhost:3000/admin` to sign in and manage content. Locally, with no
`TURSO_DATABASE_URL` or `BLOB_READ_WRITE_TOKEN` set, everything just uses a
local SQLite file and local disk — nothing to configure.

Generate a real `SESSION_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deploying to Vercel (why the admin didn't work before, and how it's fixed)

Vercel's serverless functions run on an ephemeral, largely read-only
filesystem — a database file or uploaded images written to local disk during
one request are not guaranteed to be there on the next request, and are
wiped on every redeploy. That's the actual reason the admin/content broke
after deploying: it isn't an env-var problem, it's a storage-architecture
problem. This version fixes it by moving both the database and image storage
off local disk:

1. **Create a Turso database** (free tier is enough for this):
   - Install the CLI or use https://turso.tech → create a database
   - Get the connection URL and an auth token:
     ```bash
     turso db show <db-name> --url
     turso db tokens create <db-name>
     ```
2. **Create a Vercel Blob store**: in your Vercel project → **Storage** →
   **Create Database** → **Blob**. Connect it to the project — Vercel injects
   `BLOB_READ_WRITE_TOKEN` automatically, you don't need to set it by hand.
3. **Set environment variables** in Vercel → Project Settings → Environment
   Variables (Production, and Preview if you want previews to work too):
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET` (long random string, see command above)
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. **Deploy.** The first request that touches the database creates the
   schema automatically (same as local dev) — no manual migration step.

After this, publishing/editing/deleting/uploading in `/admin` persists
permanently — a redeploy or cold start no longer wipes anything, because
nothing content-related lives on the function's local disk anymore.

If you deploy somewhere with a real persistent disk instead (a VPS, Railway,
Render, Fly.io with a volume), you can skip Turso/Blob entirely and just set
`DATA_DIR` / `UPLOAD_DIR` to a path on that persistent volume — the local
SQLite + local filesystem fallback works fine there too.

## Project structure
heloo

```
src/
  app/
    (site)/            public pages — home, /blog, /blog/[slug], /updates, /updates/[slug]
    admin/
      login/            public login page
      (protected)/      dashboard, articles, updates, media — guarded by session auth
    api/                REST-ish route handlers (auth, articles, updates, media)
  components/           public UI (cinematic hero, cards, header/footer, TOC…)
  components/admin/     admin UI (editor, forms, tables, media picker)
  lib/                  db (Turso/libSQL), auth, storage, validation, text/slug utils
scripts/seed.ts          sample content
data/                    local-mode journal.db lives here (gitignored, dev/non-Vercel only)
public/uploads/           local-mode uploads live here (gitignored, dev/non-Vercel only)
```

## Content workflow

Admin → create article/update → write with the rich-text editor → optionally
upload/attach a cover image → **Save draft** or **Publish**. Publishing (and
unpublishing/editing/deleting) immediately revalidates the relevant public
pages, so changes show up right away even though most public pages are
statically rendered for performance.

## Environment variables

See `.env.example` for the full list with comments. Required in production:

- `ADMIN_USERNAME`, `ADMIN_PASSWORD` — the single admin account
- `SESSION_SECRET` — long random string, signs admin session cookies
- `NEXT_PUBLIC_SITE_URL` — used for canonical/Open Graph metadata
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` — required on Vercel/serverless;
  optional (falls back to local file) elsewhere
- `BLOB_READ_WRITE_TOKEN` — required on Vercel for uploads to persist;
  optional (falls back to local disk) elsewhere

## Known remaining issues

- `@tiptap/core` has an open moderate advisory (GHSA-cp6q-959q-f8rh, a
  `mergeAttributes` prototype-pollution edge case) with no patched release
  yet as of this build. Low real-world risk here since the editor is only
  reachable by the authenticated admin, not public visitors — worth watching
  for a Tiptap patch.
- Next.js's own bundled `postcss` (a transitive, build-time-only dependency)
  has open advisories only fully resolved by Next 16, a larger major-version
  jump than made sense to force into this build. Not exposed to runtime
  traffic (no user-submitted CSS is processed by this app).
- No image optimization/resizing pipeline (kept out to avoid a `sharp`
  native-build dependency); images are served as uploaded. Fine at small
  scale — Vercel Blob + a CDN in front handles most of this in practice.
- Single-admin auth only, as specified. No password reset flow — rotate
  `ADMIN_PASSWORD` (and redeploy) directly if needed.
