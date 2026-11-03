# breadslicer.app

The website of [Breadslicer](https://breadslicer.app), a native resin (MSLA) slicer.

Built with [Astro](https://astro.build) into plain static HTML and CSS, with a few small
scripts and no framework running in the browser. Served by GitHub Pages.

The sample model offered on the site (`wolverine-breadslicer.zip`) is attached to the
[`sample-wolverine` release](https://github.com/breadslicer-app/breadslicer.app/releases/tag/sample-wolverine).

## Build and preview

Requires Node 22.23 or newer (the workflows use Node 24).

```sh
npm install
npm run dev       # live preview at http://localhost:4321
npm run build     # writes the site to dist/
npm run preview   # serves dist/ as it will be published
```

## Where things live

| What | Where |
| --- | --- |
| Pages | `src/pages/` (one `.astro` file per page) |
| Shared header and footer | `src/layouts/Base.astro` |
| Interface strings (menu, footer) | `src/i18n/ui.ts` |
| Styles | `src/styles/global.css` (the original look), `src/styles/pages.css` (inner pages) |
| Features page, one file per tool | `src/content/features/*.md` |
| Technical reports | `src/content/reports/*.md` (`draft: true` shows a Draft badge) |
| Changelog | `src/data/changelog.json` (newest first; the home page shows the first 3) |
| Performance tables | `src/data/performance.json` |
| Printers and formats | `src/data/printers.json` (generated, see below) |
| Roadmap | `src/data/roadmap.json` (generated, see below) |
| Images, recordings, fonts, `CNAME` | `public/` (copied as they are) |
| Home page scripts | `public/main.js` (scroll build, story), `public/site.js` (every page) |

## Updating the data

### Changelog and performance

Edit the JSON files by hand. Every performance row says how it was measured, on which build,
date and machine; leave a field as "Not recorded" rather than guess. The `comparison` block
stays `enabled: false` until there is a published method for comparisons.

### Printers

Generated from the slicer's bundled printer profiles:

```sh
npm run data:printers -- ../SoulCrafted-Slicer/assets/profiles
```

The path defaults to `../SoulCrafted-Slicer/assets/profiles` (or `$PROFILES_DIR`). Only machine
facts are copied (brand, name, panel, pixel size, build volume, file formats). Which formats
Breadslicer writes is listed in `scripts/export-printers.mjs`; update it when the slicer gains
a writer.

### Roadmap data

`npm run data:roadmap` reads the project board (organization `breadslicer-app`, project 1,
field "Status") with the GitHub CLI, signed in as you. It publishes only the title (without
its `BS-<n>:` prefix), open or closed, the board column, the labels and the closing date. Never
descriptions, comments, numbers or people. Issues labelled `private`, and titles containing a
blocked word, are left out. The blocked words are stored hashed in the script; add one with
`node scripts/export-roadmap.mjs --hash <word>` and paste the result into `BLOCKED_WORD_HASHES`.

The workflow `.github/workflows/roadmap.yml` can do this every hour by itself. It does nothing
until the repository has a secret named `ROADMAP_TOKEN`:

1. GitHub › Settings › Developer settings › Personal access tokens › **Fine-grained tokens** ›
   Generate new token.
2. **Resource owner:** `breadslicer-app`. **Expiration:** your choice (it stops working when it
   expires; the site keeps the last data).
3. **Repository access:** Only select repositories › `breadslicer-app/breadslicer`.
   **Repository permissions:** Issues › Read-only (Metadata › Read-only is added by itself).
4. **Organization permissions:** Projects › Read-only.
5. If the organization requires approval for fine-grained tokens, approve it in the
   organization settings.
6. In this repository: Settings › Secrets and variables › Actions › New repository secret,
   name `ROADMAP_TOKEN`, paste the token there (and nowhere else).

## Publishing

The workflow `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
Before the first push of this version, switch **Settings › Pages › Build and deployment ›
Source** to **GitHub Actions**: the site is no longer plain files at the root of `main`.
The custom domain comes from `public/CNAME`.

## Spanish (later)

Routing is ready for more languages: add `"es"` to `locales` in `astro.config.mjs`, put the
translated pages under `src/pages/es/`, and fill the `es` block in `src/i18n/ui.ts`.

## Licenses

Breadslicer is free software under the AGPL-3.0. Fonts (Inter, Instrument Serif, JetBrains
Mono) are loaded from Google Fonts under the SIL Open Font License.
