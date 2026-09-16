import { createClient, type Client } from "@libsql/client";
import { readingTimeMinutes, slugify } from "./text";
import type {
  Article,
  ArticleInput,
  ContentStatus,
  MediaItem,
  UpdateEntry,
  UpdateInput,
} from "./types";

// Serverless-friendly SQLite (Turso/libSQL). In production (e.g. Vercel),
// set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN to a Turso database — data
// persists there instead of on the function's ephemeral local disk. With no
// TURSO_DATABASE_URL set (local dev), this falls back to a plain local
// SQLite file, so `npm run dev` works with zero external setup.
declare global {
  // eslint-disable-next-line no-var
  var __journalDb: Client | undefined;
  // eslint-disable-next-line no-var
  var __journalDbReady: Promise<void> | undefined;
}

function createDbClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    return createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  // Local fallback — a plain file on disk, fine for dev / non-serverless hosts.
  const localPath = process.env.DATA_DIR
    ? `${process.env.DATA_DIR}/journal.db`
    : "file:./data/journal.db";
  return createClient({ url: localPath.startsWith("file:") ? localPath : `file:${localPath}` });
}

async function initSchema(db: Client): Promise<void> {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      cover_image TEXT,
      content_html TEXT NOT NULL DEFAULT '',
      author TEXT NOT NULL DEFAULT '4ANG',
      status TEXT NOT NULL DEFAULT 'draft',
      published_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      version TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'New',
      content_html TEXT NOT NULL DEFAULT '',
      cover_image TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      published_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      original_name TEXT NOT NULL,
      size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status, published_at);
    CREATE INDEX IF NOT EXISTS idx_updates_status ON updates(status, published_at);
  `);
}

export function getDb(): Client {
  if (!global.__journalDb) {
    global.__journalDb = createDbClient();
  }
  if (!global.__journalDbReady) {
    global.__journalDbReady = initSchema(global.__journalDb);
  }
  return global.__journalDb;
}

async function ready(): Promise<Client> {
  const db = getDb();
  await global.__journalDbReady;
  return db;
}

// ---------- mapping helpers ----------

function rowToArticle(row: any): Article {
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    category: row.category,
    tags: JSON.parse((row.tags as string) || "[]"),
    coverImage: row.cover_image,
    contentHtml: row.content_html,
    author: row.author,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    readingTimeMinutes: readingTimeMinutes((row.content_html as string) || ""),
  };
}

function rowToUpdate(row: any): UpdateEntry {
  return {
    id: Number(row.id),
    slug: row.slug,
    version: row.version,
    title: row.title,
    description: row.description,
    type: row.type,
    contentHtml: row.content_html,
    coverImage: row.cover_image,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToMedia(row: any): MediaItem {
  return {
    id: Number(row.id),
    filename: row.filename,
    url: row.url,
    originalName: row.original_name,
    size: Number(row.size),
    mimeType: row.mime_type,
    createdAt: row.created_at,
  };
}

async function uniqueSlug(
  base: string,
  table: "articles" | "updates",
  excludeId?: number
): Promise<string> {
  const db = await ready();
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = excludeId
      ? `SELECT id FROM ${table} WHERE slug = ? AND id != ?`
      : `SELECT id FROM ${table} WHERE slug = ?`;
    const args = excludeId ? [slug, excludeId] : [slug];
    const result = await db.execute({ sql: query, args });
    if (result.rows.length === 0) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

function slugifyOrFallback(input: string): string {
  const slug = slugify(input);
  return slug || `entry-${Date.now()}`;
}

// ---------- Articles ----------

export const ArticlesRepo = {
  async listPublished(): Promise<Article[]> {
    const db = await ready();
    const result = await db.execute(
      `SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC`
    );
    return result.rows.map(rowToArticle);
  },

  async listAll(): Promise<Article[]> {
    const db = await ready();
    const result = await db.execute(`SELECT * FROM articles ORDER BY updated_at DESC`);
    return result.rows.map(rowToArticle);
  },

  async getBySlug(slug: string, opts?: { includeDrafts?: boolean }): Promise<Article | null> {
    const db = await ready();
    const query = opts?.includeDrafts
      ? `SELECT * FROM articles WHERE slug = ?`
      : `SELECT * FROM articles WHERE slug = ? AND status = 'published'`;
    const result = await db.execute({ sql: query, args: [slug] });
    return result.rows[0] ? rowToArticle(result.rows[0]) : null;
  },

  async getById(id: number): Promise<Article | null> {
    const db = await ready();
    const result = await db.execute({ sql: `SELECT * FROM articles WHERE id = ?`, args: [id] });
    return result.rows[0] ? rowToArticle(result.rows[0]) : null;
  },

  async related(article: Article, limit = 3): Promise<Article[]> {
    const all = (await this.listPublished()).filter((a) => a.id !== article.id);
    const scored = all.map((a) => {
      let score = 0;
      if (a.category === article.category) score += 2;
      score += a.tags.filter((t) => article.tags.includes(t)).length;
      return { a, score };
    });
    return scored
      .filter((s) => s.score > 0)
      .sort((x, y) => y.score - x.score)
      .slice(0, limit)
      .map((s) => s.a);
  },

  async create(input: ArticleInput): Promise<Article> {
    const db = await ready();
    const base = slugifyOrFallback(input.slug || input.title);
    const slug = await uniqueSlug(base, "articles");
    const now = new Date().toISOString();
    const publishedAt = input.status === "published" ? now : null;
    const result = await db.execute({
      sql: `
        INSERT INTO articles
          (slug, title, subtitle, description, category, tags, cover_image, content_html, author, status, published_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        slug,
        input.title,
        input.subtitle || null,
        input.description,
        input.category,
        JSON.stringify(input.tags || []),
        input.coverImage || null,
        input.contentHtml,
        input.author || "4ANG",
        input.status,
        publishedAt,
        now,
        now,
      ],
    });
    return (await this.getById(Number(result.lastInsertRowid)))!;
  },

  async update(id: number, input: ArticleInput): Promise<Article | null> {
    const db = await ready();
    const existing = await this.getById(id);
    if (!existing) return null;

    let slug = existing.slug;
    const desiredBase = slugifyOrFallback(input.slug || input.title);
    if (desiredBase !== existing.slug) {
      slug = await uniqueSlug(desiredBase, "articles", id);
    }

    const now = new Date().toISOString();
    const wasPublished = existing.status === "published";
    const willBePublished = input.status === "published";
    const publishedAt = willBePublished
      ? existing.publishedAt || now
      : wasPublished && !willBePublished
      ? null
      : existing.publishedAt;

    await db.execute({
      sql: `
        UPDATE articles SET
          slug = ?, title = ?, subtitle = ?, description = ?, category = ?, tags = ?,
          cover_image = ?, content_html = ?, author = ?, status = ?, published_at = ?, updated_at = ?
        WHERE id = ?
      `,
      args: [
        slug,
        input.title,
        input.subtitle || null,
        input.description,
        input.category,
        JSON.stringify(input.tags || []),
        input.coverImage || null,
        input.contentHtml,
        input.author || existing.author,
        input.status,
        publishedAt,
        now,
        id,
      ],
    });
    return this.getById(id);
  },

  async setStatus(id: number, status: ContentStatus): Promise<Article | null> {
    const db = await ready();
    const existing = await this.getById(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const publishedAt = status === "published" ? existing.publishedAt || now : null;
    await db.execute({
      sql: `UPDATE articles SET status = ?, published_at = ?, updated_at = ? WHERE id = ?`,
      args: [status, publishedAt, now, id],
    });
    return this.getById(id);
  },

  async delete(id: number): Promise<boolean> {
    const db = await ready();
    const result = await db.execute({ sql: `DELETE FROM articles WHERE id = ?`, args: [id] });
    return result.rowsAffected > 0;
  },
};

// ---------- Updates ----------

export const UpdatesRepo = {
  async listPublished(): Promise<UpdateEntry[]> {
    const db = await ready();
    const result = await db.execute(
      `SELECT * FROM updates WHERE status = 'published' ORDER BY published_at DESC`
    );
    return result.rows.map(rowToUpdate);
  },

  async listAll(): Promise<UpdateEntry[]> {
    const db = await ready();
    const result = await db.execute(`SELECT * FROM updates ORDER BY updated_at DESC`);
    return result.rows.map(rowToUpdate);
  },

  async getBySlug(slug: string, opts?: { includeDrafts?: boolean }): Promise<UpdateEntry | null> {
    const db = await ready();
    const query = opts?.includeDrafts
      ? `SELECT * FROM updates WHERE slug = ?`
      : `SELECT * FROM updates WHERE slug = ? AND status = 'published'`;
    const result = await db.execute({ sql: query, args: [slug] });
    return result.rows[0] ? rowToUpdate(result.rows[0]) : null;
  },

  async getById(id: number): Promise<UpdateEntry | null> {
    const db = await ready();
    const result = await db.execute({ sql: `SELECT * FROM updates WHERE id = ?`, args: [id] });
    return result.rows[0] ? rowToUpdate(result.rows[0]) : null;
  },

  async related(entry: UpdateEntry, limit = 3): Promise<UpdateEntry[]> {
    const all = await this.listPublished();
    return all.filter((u) => u.id !== entry.id).slice(0, limit);
  },

  async create(input: UpdateInput): Promise<UpdateEntry> {
    const db = await ready();
    const base = slugifyOrFallback(input.slug || `${input.version}-${input.title}`);
    const slug = await uniqueSlug(base, "updates");
    const now = new Date().toISOString();
    const publishedAt = input.status === "published" ? now : null;
    const result = await db.execute({
      sql: `
        INSERT INTO updates
          (slug, version, title, description, type, content_html, cover_image, status, published_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        slug,
        input.version,
        input.title,
        input.description,
        input.type,
        input.contentHtml,
        input.coverImage || null,
        input.status,
        publishedAt,
        now,
        now,
      ],
    });
    return (await this.getById(Number(result.lastInsertRowid)))!;
  },

  async update(id: number, input: UpdateInput): Promise<UpdateEntry | null> {
    const db = await ready();
    const existing = await this.getById(id);
    if (!existing) return null;

    let slug = existing.slug;
    const desiredBase = slugifyOrFallback(input.slug || `${input.version}-${input.title}`);
    if (desiredBase !== existing.slug) {
      slug = await uniqueSlug(desiredBase, "updates", id);
    }

    const now = new Date().toISOString();
    const wasPublished = existing.status === "published";
    const willBePublished = input.status === "published";
    const publishedAt = willBePublished
      ? existing.publishedAt || now
      : wasPublished && !willBePublished
      ? null
      : existing.publishedAt;

    await db.execute({
      sql: `
        UPDATE updates SET
          slug = ?, version = ?, title = ?, description = ?, type = ?, content_html = ?,
          cover_image = ?, status = ?, published_at = ?, updated_at = ?
        WHERE id = ?
      `,
      args: [
        slug,
        input.version,
        input.title,
        input.description,
        input.type,
        input.contentHtml,
        input.coverImage || null,
        input.status,
        publishedAt,
        now,
        id,
      ],
    });
    return this.getById(id);
  },

  async setStatus(id: number, status: ContentStatus): Promise<UpdateEntry | null> {
    const db = await ready();
    const existing = await this.getById(id);
    if (!existing) return null;
    const now = new Date().toISOString();
    const publishedAt = status === "published" ? existing.publishedAt || now : null;
    await db.execute({
      sql: `UPDATE updates SET status = ?, published_at = ?, updated_at = ? WHERE id = ?`,
      args: [status, publishedAt, now, id],
    });
    return this.getById(id);
  },

  async delete(id: number): Promise<boolean> {
    const db = await ready();
    const result = await db.execute({ sql: `DELETE FROM updates WHERE id = ?`, args: [id] });
    return result.rowsAffected > 0;
  },
};

// ---------- Media ----------

export const MediaRepo = {
  async list(): Promise<MediaItem[]> {
    const db = await ready();
    const result = await db.execute(`SELECT * FROM media ORDER BY created_at DESC`);
    return result.rows.map(rowToMedia);
  },

  async create(item: Omit<MediaItem, "id" | "createdAt">): Promise<MediaItem> {
    const db = await ready();
    const now = new Date().toISOString();
    const result = await db.execute({
      sql: `INSERT INTO media (filename, url, original_name, size, mime_type, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [item.filename, item.url, item.originalName, item.size, item.mimeType, now],
    });
    return { ...item, id: Number(result.lastInsertRowid), createdAt: now };
  },

  async getById(id: number): Promise<MediaItem | null> {
    const db = await ready();
    const result = await db.execute({ sql: `SELECT * FROM media WHERE id = ?`, args: [id] });
    return result.rows[0] ? rowToMedia(result.rows[0]) : null;
  },

  async delete(id: number): Promise<boolean> {
    const db = await ready();
    const result = await db.execute({ sql: `DELETE FROM media WHERE id = ?`, args: [id] });
    return result.rowsAffected > 0;
  },
};
