import type { APIRoute } from "astro";
import { AUTHOR, getPosts, kindLine } from "../../lib/blog";

// RSS 2.0 feed of the blog, written by hand: no extra dependency for twenty lines of XML.
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL("https://breadslicer.app")).toString().replace(/\/$/, "");
  const posts = await getPosts();
  const items = posts
    .map((p) => {
      const url = `${base}/blog/${p.id}/`;
      return `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${p.data.date.toUTCString()}</pubDate>
      <category>${esc(kindLine(p))}</category>
      <description>${esc(p.data.summary)}</description>
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Breadslicer blog</title>
    <link>${base}/blog/</link>
    <description>Releases, notes and mini-papers from ${esc(AUTHOR)}, on Breadslicer, a native resin slicer.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
