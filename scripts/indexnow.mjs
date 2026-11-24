// Tells Bing, Yandex and the other IndexNow engines that the site changed, so a new page or post
// is crawled within hours instead of weeks. ChatGPT's web search reads Bing's index.
//
//   node scripts/indexnow.mjs            every URL in dist/sitemap-0.xml (run after `npm run build`)
//   node scripts/indexnow.mjs --dry-run  only list them
//
// The key is public by design: IndexNow checks that https://breadslicer.app/<key>.txt holds it.
// The deploy workflow runs this after a push to main (not after the hourly roadmap refresh).

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const KEY = "d4bc861dc7f6c47d530dc03ba3dff19f";
const HOST = "breadslicer.app";
const here = dirname(fileURLToPath(import.meta.url));

const xml = readFileSync(join(here, "..", "dist", "sitemap-0.xml"), "utf8");
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urls.length) throw new Error("No URLs in dist/sitemap-0.xml: build the site first.");

if (process.argv.includes("--dry-run")) {
  console.log(urls.join("\n"));
  console.log(`${urls.length} URLs`);
  process.exit(0);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
// 200 and 202 are both "received". 403: the key file is not live yet; 422: a URL is not on the host.
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urls.length} URLs`);
if (res.status >= 400) process.exitCode = 1;
