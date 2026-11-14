// Interface strings shared by every page (navigation, footer, labels).
// Page bodies live in Markdown and data files. To add a language: add it to
// `languages`, give it a block in `ui` (missing keys fall back to English) and
// add its code to `locales` in astro.config.mjs.

export const languages = { en: "English" } as const;
export const defaultLang = "en";
export type Lang = keyof typeof languages;

export const ui = {
  en: {
    "site.name": "Breadslicer",
    "site.tagline": "Native resin slicer",
    "site.description":
      "Breadslicer is a native resin (MSLA) slicer written in Rust: supports, hollowing, repair and slicing that keep up with you. In development.",
    "skip": "Skip to content",
    "menu": "Menu",
    "nav.features": "Features",
    "nav.performance": "Performance",
    "nav.printers": "Printers",
    "nav.roadmap": "Roadmap",
    "nav.reports": "Reports",
    "nav.changelog": "Changelog",
    "nav.bread": ".bread format",
    "nav.community": "Community",
    "nav.cta": "Early access",
    "footer.product": "Product",
    "footer.project": "Project",
    "footer.community": "Community",
    "footer.legal": "Free software under the AGPL-3.0. © 2026 SynrgStudio.",
    "footer.credits": "Credits and licenses.",
    "footer.validation": "Printer files are checked by reading them back with UVtools, an open-source resin file tool.",
    "draft": "Draft",
    "updated": "Updated",
    "source": "Source",
  },
  es: {},
} satisfies Record<string, Record<string, string>>;

export type UiKey = keyof (typeof ui)["en"];

export function useTranslations(lang: string | undefined) {
  const table = (ui as Record<string, Partial<Record<UiKey, string>>>)[lang ?? defaultLang] ?? {};
  return (key: UiKey): string => table[key] ?? ui.en[key];
}

/** Primary navigation, in order. */
export const nav: { key: UiKey; href: string }[] = [
  { key: "nav.features", href: "/features/" },
  { key: "nav.performance", href: "/performance/" },
  { key: "nav.printers", href: "/printers/" },
  { key: "nav.roadmap", href: "/roadmap/" },
  { key: "nav.reports", href: "/reports/" },
  { key: "nav.community", href: "/community/" },
];
