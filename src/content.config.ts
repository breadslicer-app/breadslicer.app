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

export const collections = { reports, features };
