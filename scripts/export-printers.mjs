// Builds src/data/printers.json from the slicer's bundled printer profiles.
//
//   node scripts/export-printers.mjs [path/to/assets/profiles]
//
// The path defaults to $PROFILES_DIR, then to ../SoulCrafted-Slicer/assets/profiles
// (the slicer repository checked out next to this one). Only facts about the
// machines are copied: brand, name, panel, build volume and the file formats each
// profile declares. Photos are not copied.

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "smol-toml";

const here = dirname(fileURLToPath(import.meta.url));
const profiles = resolve(
  process.argv[2] ?? process.env.PROFILES_DIR ?? join(here, "..", "..", "SoulCrafted-Slicer", "assets", "profiles"),
);
const printersDir = join(profiles, "printers");
if (!existsSync(printersDir)) {
  console.error(`No printers folder at ${printersDir}. Pass the profiles folder as the first argument.`);
  process.exit(1);
}

// What the slicer writes today, by profile binding (format + version).
// Kept in step with PrinterFileFormat::from_binding / has_writer in the slicer.
const ANYCUBIC_ZIP = ["pwsz", "pm7", "pm7m", "pm4u", "pp1", "pp1m"];
const ANYCUBIC_BINARY = [
  "pws", "pw0", "pwx", "dlp", "dl2p", "pwmx", "pmx2", "pwmb", "px6s", "pwmo", "pm3n",
  "pm4n", "pwms", "pwma", "pmsq", "pm3", "pm3m", "pm3r", "pm5", "pm5s", "m5sp",
];

function describe(format, version) {
  const v = (version ?? "").toLowerCase();
  switch (format) {
    case "ctb":
      if (["v2", "v3", "v4", "v5"].includes(v)) return { label: `.ctb ${v}`, writable: true };
      if (v === "v5enc") return { label: ".ctb v5 (encrypted)", writable: true };
      return { label: `.ctb ${version ?? ""}`.trim(), writable: false };
    case "goo":
      if (v === "v3.0") return { label: ".goo v3.0", writable: true };
      return { label: `.goo ${version ?? ""}`.trim(), writable: false };
    case "cxdlp":
      if (v === "v2" || v === "v3") return { label: `.cxdlp ${v}`, writable: true };
      return { label: `.cxdlp ${version ?? ""}`.trim(), writable: false };
    case "azf":
      return { label: `.${v}`, writable: ANYCUBIC_ZIP.includes(v) };
    case "aff":
      return { label: `.${v}`, writable: ANYCUBIC_BINARY.includes(v) };
    default:
      return { label: version ? `${format} ${version}` : format, writable: false };
  }
}

const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

const printers = readdirSync(printersDir)
  .filter((f) => f.endsWith(".toml"))
  .map((file) => {
    const p = parse(readFileSync(join(printersDir, file), "utf8"));
    const id = p.identity ?? {};
    const hw = p.hardware ?? {};
    const res = hw.pixel_resolution ?? {};
    const px = hw.pixel_size_microns ?? {};
    const vol = hw.build_volume ?? {};
    const formats = (p.capabilities?.output_formats ?? []).map((b) => describe(b.format, b.version));
    return {
      brand: id.manufacturer ?? "",
      name: id.name ?? file.replace(/\.toml$/, ""),
      family: id.family ?? "",
      resolution: res.x && res.y ? [res.x, res.y] : null,
      pixel_um: px.x && px.y ? [round(px.x, 1), round(px.y, 1)] : null,
      volume_mm: vol.x_mm && vol.y_mm && vol.z_mm ? [round(vol.x_mm, 1), round(vol.y_mm, 1), round(vol.z_mm, 1)] : null,
      formats,
      exports: formats.some((f) => f.writable),
    };
  })
  .sort((a, b) => a.brand.localeCompare(b.brand, "en") || a.name.localeCompare(b.name, "en", { numeric: true }));

const out = {
  generated: new Date().toISOString().slice(0, 10),
  count: printers.length,
  exporting: printers.filter((p) => p.exports).length,
  printers,
};
const target = join(here, "..", "src", "data", "printers.json");
writeFileSync(target, JSON.stringify(out, null, 1) + "\n");
console.log(`${out.count} printers (${out.exporting} with a format Breadslicer writes) -> ${target}`);
