import { z } from "zod";
import { BLOG_CATEGORIES, UPDATE_TYPES } from "./types";

export const articleSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(160),
  subtitle: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().min(10, "Add a short description").max(300),
  category: z.enum(BLOG_CATEGORIES as unknown as [string, ...string[]]),
  tags: z.array(z.string().trim().min(1)).max(10).default([]),
  coverImage: z.string().trim().optional().nullable(),
  contentHtml: z.string().min(1, "Article content can't be empty"),
  author: z.string().trim().max(80).optional(),
  status: z.enum(["draft", "published"]),
  slug: z.string().trim().max(160).optional(),
});

export const updateSchema = z.object({
  version: z.string().trim().min(1, "Version is required").max(40),
  title: z.string().trim().min(3, "Title is too short").max(160),
  description: z.string().trim().min(10, "Add a short description").max(300),
  type: z.enum(UPDATE_TYPES as unknown as [string, ...string[]]),
  contentHtml: z.string().min(1, "Update content can't be empty"),
  coverImage: z.string().trim().optional().nullable(),
  status: z.enum(["draft", "published"]),
  slug: z.string().trim().max(160).optional(),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});
