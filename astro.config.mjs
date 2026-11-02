// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// English only for now. To add Spanish later: add "es" to `locales`, put the
// translated pages under src/pages/es/, and fill `es` in src/i18n/ui.ts.
export default defineConfig({
  site: "https://breadslicer.app",
  trailingSlash: "ignore",
  build: { format: "directory" },
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap()],
});
