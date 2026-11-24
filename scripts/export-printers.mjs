// Builds src/data/printers.json from the slicer's bundled printer profiles.
//
//   node scripts/export-printers.mjs [path/to/assets/profiles]
//
// The path defaults to $PROFILES_DIR, then to ../SoulCrafted-Slicer/assets/profiles
// (the slicer repository checked out next to this one). Only facts about the
// machines are copied: brand, name, panel, build volume and the file formats each
// profile declares. Photos are not copied. Each printer also gets the resin settings
// the bundled material profiles hold for it (their makers' published figures), for
// the printer's own page.

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { execFileSync } from "node:child_process";
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
    case "sl1":
      if (v === "sl1" || v === "sl1s") return { label: `.${v}`, writable: true };
      return { label: `.sl1 ${version ?? ""}`.trim(), writable: false };
    default:
      return { label: version ? `${format} ${version}` : format, writable: false };
  }
}

const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

// What the current download has: the profiles at the release's tag (src/data/release.json), read
// from the slicer's git history. Without git or the tag, everything counts as in the download.
const release = JSON.parse(readFileSync(join(here, "..", "src", "data", "release.json"), "utf8"));
const tag = `v${release.version}`;
let atTag = null;
try {
  const top = execFileSync("git", ["-C", profiles, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  const rel = relative(top, profiles).replaceAll("\\", "/");
  const git = (...a) => execFileSync("git", ["-C", top, ...a], { encoding: "utf8", maxBuffer: 1 << 26 });
  const names = (dir) => git("ls-tree", "--name-only", tag, `${rel}/${dir}/`).split(/\r?\n/).filter((f) => f.endsWith(".toml"));
  const printersAt = new Set(names("printers").map((f) => f.split("/").pop().replace(/\.toml$/, "")));
  const pairsAt = new Set();
  for (const f of names("materials")) {
    const m = parse(git("show", `${tag}:${f}`));
    for (const printer of Object.keys(m.per_printer ?? {})) pairsAt.add(`${m.identity?.id}|${printer}`);
  }
  atTag = { printers: printersAt, pairs: pairsAt };
} catch (e) {
  console.warn(`Could not read the profiles at ${tag}; every profile counts as in the download. (${e.message.split(/\r?\n/)[0]})`);
}

// Resin settings, by printer id: the [per_printer.<id>] blocks of every material profile.
const materialsDir = join(profiles, "materials");
const resinsFor = new Map();
for (const file of existsSync(materialsDir) ? readdirSync(materialsDir).filter((f) => f.endsWith(".toml")) : []) {
  const m = parse(readFileSync(join(materialsDir, file), "utf8"));
  const id = m.identity ?? {};
  const layer = m.intent?.target_layer_height_mm;
  for (const [printer, s] of Object.entries(m.per_printer ?? {})) {
    if (s.normal_exposure_sec == null) continue;
    const row = {
      in_release: atTag ? atTag.pairs.has(`${id.id}|${printer}`) : true,
      brand: id.brand ?? "",
      name: id.name ?? file.replace(/\.toml$/, ""),
      layer_um: layer ? Math.round(layer * 1000) : null,
      normal_s: round(s.normal_exposure_sec, 2),
      bottom_s: s.bottom_exposure_sec != null ? round(s.bottom_exposure_sec, 2) : null,
      bottom_layers: s.bottom_layer_count ?? null,
      lift_mm: s.lift_distance_mm != null ? round(s.lift_distance_mm, 2) : null,
      lift_mm_min: s.lift_speed_mm_min != null ? Math.round(s.lift_speed_mm_min) : null,
    };
    if (!resinsFor.has(printer)) resinsFor.set(printer, []);
    resinsFor.get(printer).push(row);
  }
}

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
    const cap = p.capabilities ?? {};
    const pid = id.id ?? file.replace(/\.toml$/, "");
    const resins = (resinsFor.get(pid) ?? []).sort(
      (a, b) => a.brand.localeCompare(b.brand, "en") || a.name.localeCompare(b.name, "en", { numeric: true }) || (a.layer_um ?? 0) - (b.layer_um ?? 0),
    );
    return {
      id: pid,
      in_release: atTag ? atTag.printers.has(pid) : true,
      brand: id.manufacturer ?? "",
      name: id.name ?? file.replace(/\.toml$/, ""),
      family: id.family ?? "",
      resolution: res.x && res.y ? [res.x, res.y] : null,
      pixel_um: px.x && px.y ? [round(px.x, 1), round(px.y, 1)] : null,
      volume_mm: vol.x_mm && vol.y_mm && vol.z_mm ? [round(vol.x_mm, 1), round(vol.y_mm, 1), round(vol.z_mm, 1)] : null,
      formats,
      exports: formats.some((f) => f.writable),
      features: {
        grayscale: !!cap.supports_grayscale,
        two_stage: !!cap.two_stage_lift,
        camera: !!cap.has_camera,
        tilting_vat: !!cap.tilting_vat,
        network: cap.network_protocol ?? null,
        mirror: [!!hw.mirror?.x, !!hw.mirror?.y],
      },
      resins,
    };
  })
  .sort((a, b) => a.brand.localeCompare(b.brand, "en") || a.name.localeCompare(b.name, "en", { numeric: true }));

const out = {
  generated: new Date().toLocaleDateString("sv"), // local day, YYYY-MM-DD
  release: release.version,
  count: printers.length,
  exporting: printers.filter((p) => p.exports).length,
  printers,
};
const target = join(here, "..", "src", "data", "printers.json");
writeFileSync(target, JSON.stringify(out, null, 1) + "\n");
console.log(`${out.count} printers (${out.exporting} with a format Breadslicer writes) -> ${target}`);
