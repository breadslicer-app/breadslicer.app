import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

/** Who signs every post. */
export const AUTHOR = "SynrgStudio";

export const KIND: Record<Post["data"]["kind"], { label: string; plural: string }> = {
  release: { label: "Release", plural: "Releases" },
  paper: { label: "Mini-paper", plural: "Mini-papers" },
  note: { label: "Note", plural: "Notes" },
};

/** Published posts, newest first. Posts with `draft: true` are not built at all. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", (p) => !p.data.draft);
  // Same day: the release post first.
  const rank = (p: Post) => (p.data.kind === "release" ? 0 : 1);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || rank(a) - rank(b) || a.id.localeCompare(b.id));
}

/** "Release · 0.4.0-alpha.1", "Mini-paper", "Note". */
export function kindLine(p: Post): string {
  const k = KIND[p.data.kind].label;
  return p.data.version ? `${k} · ${p.data.version}` : k;
}
