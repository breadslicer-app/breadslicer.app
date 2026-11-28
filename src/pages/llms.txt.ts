import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getPosts, kindLine } from "../lib/blog";
import { slugify } from "../lib/format";
import release from "../data/release.json";
import printers from "../data/printers.json";

// /llms.txt: the site in plain Markdown for AI assistants and their search (llmstxt.org).
// Built from the same data as the pages, so it never says more than they do.
export const GET: APIRoute = async () => {
  const base = "https://breadslicer.app";
  const posts = await getPosts();
  const reports = (await getCollection("reports", (r) => !r.data.draft)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const features = (await getCollection("features")).sort((a, b) => a.data.order - b.data.order);
  const inRelease = printers.printers.filter((p) => p.in_release && p.id !== "generic-machine");
  const brands = [...new Set(inRelease.map((p) => p.brand))].sort();
  const writes = inRelease.filter((p) => p.exports).length;
  const withResins = inRelease.filter((p) => p.resins.some((r) => r.in_release)).length;
  const next = posts.filter((p) => p.data.next);

  const lines = [
    "# Breadslicer",
    "",
    `> Breadslicer is a free, native resin (MSLA/LCD) 3D printing slicer for ${release.platform}, written in Rust and published under the AGPL-3.0 by SynrgStudio. It orients, supports, hollows, repairs, arranges and slices models for resin printers and writes their print files. The current download is ${release.version} (${release.date}), an open beta.`,
    "",
    `- Download: ${release.installer} (${release.installer_size} installer, no administrator rights needed)`,
    `- Portable: ${release.zip} (${release.zip_size} zip: unzip it and run breadslicer.exe)`,
    ...(release.dev?.linux
      ? [`- Linux (early, development build only): Breadslicer Dev ${release.dev.linux.version} for x86_64 with glibc 2.35 or newer, as an AppImage (${release.dev.linux.appimage}, ${release.dev.linux.appimage_size}), a tar.gz (${release.dev.linux.tar}, ${release.dev.linux.tar_size}) and a PKGBUILD for Arch (${release.dev.linux.pkgbuild}). The first Linux build: tested only in containers so far, not on a real desktop. It does not update itself, and there is no regular Linux release yet.`]
      : []),
    `- Release notes: ${base}${release.post}`,
    `- Source code: https://github.com/breadslicer-app/breadslicer`,
    `- Printers: ${release.printers} printer profiles in ${release.version}, from ${brands.length} brands (${brands.join(", ")}). Breadslicer writes the print file for ${writes} of them (.ctb, .goo, .cxdlp, Prusa .sl1 and .sl1s, and Anycubic ZIP and binary files such as .pwmx and .pm7); the others can be prepared and sliced. Each printer has a page with its panel and its print file, and ${withResins} of them list the resin settings their makers publish (exposure, bottom layers, lift): ${base}/printers/`,
    "- Price: free. Community and support on Discord: " + `${base}/community/`,
    "",
    "## What it does",
    "",
    ...features.map((f) => `- **${f.data.title}** (${f.data.kicker}): ${base}/features/#${slugify(f.data.kicker.split("·")[0])}`),
    "",
    "## Pages",
    "",
    `- [Features](${base}/features/): every tool, with what it does and its shortcuts`,
    `- [Performance](${base}/performance/): measured timings, each with its method, build, date and machine`,
    `- [Printers and formats](${base}/printers/): every printer profile and the print files Breadslicer writes`,
    `- [The .bread format](${base}/bread-format/): the open project format, with supports saved as editable data`,
    `- [Roadmap](${base}/roadmap/): the real work board`,
    `- [Changelog](${base}/changelog/)`,
    `- [Credits and licenses](${base}/credits/)`,
    "",
    "## Blog",
    "",
    ...(next.length ? [`Posts marked (next build) describe the development builds, not ${release.version}.`, ""] : []),
    ...posts.map((p) => `- [${p.data.title}](${base}/blog/${p.id}/) (${kindLine(p)}, ${p.data.date.toISOString().slice(0, 10)}${p.data.next ? ", next build" : ""}): ${p.data.summary}`),
    "",
    "## Technical reports",
    "",
    ...reports.map((r) => `- [${r.data.title}](${base}/reports/${r.id}/): ${r.data.summary}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
