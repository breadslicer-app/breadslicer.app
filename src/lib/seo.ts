// Structured data (schema.org JSON-LD) for search engines and AI answers. Every value comes from
// the site's own data: release.json, printers.json, the blog and the reports.
import release from "../data/release.json";
import printers from "../data/printers.json";
import { AUTHOR } from "./blog";

export const SITE = "https://breadslicer.app";
const abs = (path: string) => new URL(path, SITE).toString();

const ORG_ID = `${SITE}/#org`;

export function organization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: AUTHOR,
    url: SITE,
    logo: abs("/assets/logo-512.png"),
    sameAs: ["https://github.com/breadslicer-app", "https://www.patreon.com/cw/synrgstudio", "https://ko-fi.com/synrg"],
  };
}

export function website() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#site`,
    name: "Breadslicer",
    url: SITE,
    publisher: { "@id": ORG_ID },
  };
}

/** The app itself, as the current download offers it. */
export function software(description: string) {
  const writable = printers.printers.filter((p) => p.exports && p.in_release).length;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE}/#app`,
    name: "Breadslicer",
    alternateName: "Breadslicer resin slicer",
    description,
    url: SITE,
    applicationCategory: "DesignApplication",
    applicationSubCategory: "Resin 3D printing slicer (MSLA)",
    operatingSystem: release.platform,
    softwareVersion: release.version,
    datePublished: release.date,
    downloadUrl: release.zip,
    releaseNotes: abs(release.post),
    license: "https://www.gnu.org/licenses/agpl-3.0.html",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    screenshot: ["supports", "hollow", "slice"].map((s) => abs(`/assets/shots/${s}.webp`)),
    image: abs("/assets/og-image.png"),
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    featureList: [
      "Automatic and manual supports, saved as editable data",
      "Exact hollowing with drain holes",
      "Mesh repair",
      "Auto-orient, arrange and fill bed",
      "Print-file review with Fix all",
      `${release.printers} resin printer profiles; writes the print file for ${writable} of them`,
      "The .bread project format",
    ],
  };
}

type Dated = { title: string; summary: string; date: Date };

/** A blog post or a report. */
export function article(kind: "BlogPosting" | "TechArticle", path: string, d: Dated, image?: string) {
  return {
    "@context": "https://schema.org",
    "@type": kind,
    headline: d.title,
    description: d.summary,
    datePublished: d.date.toISOString(),
    url: abs(path),
    mainEntityOfPage: abs(path),
    image: abs(image ?? "/assets/og-image.png"),
    inLanguage: "en",
    author: { "@type": "Organization", "@id": ORG_ID, name: AUTHOR, url: SITE },
    publisher: { "@id": ORG_ID },
    about: { "@id": `${SITE}/#app` },
  };
}

/** The first image a post's Markdown shows, for its share card and its structured data. */
export function firstImage(markdown: string | undefined): string | undefined {
  const m = markdown?.match(/<img\s[^>]*src="(\/[^"]+)"|!\[[^\]]*\]\((\/[^)\s]+)/);
  return m ? (m[1] ?? m[2]) : undefined;
}
