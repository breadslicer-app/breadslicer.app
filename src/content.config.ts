import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Technical reports: long-form, one Markdown file each.
const reports = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/reports" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

// Blog: one post per release, plus technical notes and mini-papers. The id is the `slug` in the front matter.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    /** release: what a build brings · paper: method and measurements · note: a shorter story. */
    kind: z.enum(["release", "paper", "note"]),
    /** Release posts only. */
    version: z.string().optional(),
    /** On main and in test builds, not yet in a release: the post says so. */
    next: z.boolean().default(false),
  }),
});

// Features page: one Markdown file per tool, shown in `order`.
const features = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/features" }),
  schema: z.object({
    title: z.string(),
    kicker: z.string(),
    order: z.number(),
    /** A recording in public/assets/clips (name without extension). */
    clip: z.string().optional(),
    /** A still in public/assets/shots (file name). */
    shot: z.string().optional(),
    alt: z.string().optional(),
    keys: z.array(z.string()).default([]),
    /** Short facts shown beside the text. */
    facts: z.array(z.object({ k: z.string(), v: z.string() })).default([]),
  }),
});

export const collections = { reports, blog, features };
