export type ContentStatus = "draft" | "published";

export type UpdateType = "New" | "Improved" | "Fixed" | "Changed" | "Removed";

export const BLOG_CATEGORIES = [
  "Product",
  "Engineering",
  "Design",
  "Community",
  "Behind 4ANG",
  "Announcement",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const UPDATE_TYPES: UpdateType[] = [
  "New",
  "Improved",
  "Fixed",
  "Changed",
  "Removed",
];

export interface Article {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  category: string;
  tags: string[];
  coverImage: string | null;
  contentHtml: string;
  author: string;
  status: ContentStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
}

export interface UpdateEntry {
  id: number;
  slug: string;
  version: string;
  title: string;
  description: string;
  type: UpdateType;
  contentHtml: string;
  coverImage: string | null;
  status: ContentStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: number;
  filename: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface ArticleInput {
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  tags: string[];
  coverImage?: string | null;
  contentHtml: string;
  author?: string;
  status: ContentStatus;
  slug?: string;
}

export interface UpdateInput {
  version: string;
  title: string;
  description: string;
  type: UpdateType;
  contentHtml: string;
  coverImage?: string | null;
  status: ContentStatus;
  slug?: string;
}
