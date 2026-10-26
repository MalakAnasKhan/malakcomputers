import { createHash, randomUUID } from "node:crypto";
import { lstat, mkdir, open, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import sharp from "sharp";

type CatalogIdentity = { readonly slug: string; readonly name: string };
type Group = { name: string; slug: string; files: Record<string, string[]>; missing: number[]; issues: string[]; matched: string | null };
type CachedImage = { signature: string; source: string; sourceHash: string; outputHash: string; originalBytes: number; optimizedBytes: number; width: number; height: number; quality: number };
export type ImageResult = CachedImage & { output: string; cached: boolean };
export type ImportReport = { groups: Group[]; images: ImageResult[]; issues: string[]; ignored: string[]; processed: number; cached: number; originalBytes: number; optimizedBytes: number; savingsPercent: number };
const extensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff", ".heic", ".heif", ".gif"]);
const signature = `v1:${sharp.versions.sharp}:${sharp.versions.vips}:1200:inside:no-enlarge:auto-orient:q90-86-82:effort6`;
const hash = (buffer: Buffer) => createHash("sha256").update(buffer).digest("hex");

export function imageSlug(name: string): string {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function scanImageGroups(names: readonly string[], catalog: readonly CatalogIdentity[]) {
  const groups = new Map<string, Group>();
  const issues: string[] = [], ignored: string[] = [];
  for (const filename of [...names].sort()) {
    const extension = extname(filename);
    if (!extensions.has(extension.toLowerCase())) { ignored.push(filename); continue; }
    const match = filename.slice(0, -extension.length).match(/^(.*?)[ _-]+([1-4])$/u);
    if (!match || !match[1].trim()) { issues.push(`Ambiguous filename (expected product name and number 1–4): ${filename}`); continue; }
    const name = match[1].trim();
    const group = groups.get(name) ?? { name, slug: imageSlug(name), files: {}, missing: [], issues: [], matched: null };
    (group.files[match[2]] ??= []).push(filename);
    groups.set(name, group);
  }
  for (const group of groups.values()) {
    if (!group.slug || /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/.test(group.slug) || group.slug.length > 120) group.issues.push("Unsafe or unsupported product slug.");
    if ([...groups.values()].filter(other => other.slug === group.slug).length !== 1) group.issues.push("Multiple group names normalize to the same output slug.");
    for (const number of [1, 2, 3, 4]) {
      if (!group.files[number]) group.missing.push(number);
      else if (group.files[number].length !== 1) group.issues.push(`Duplicate image number ${number}.`);
    }
    if (group.missing.length) group.issues.push(`Missing images: ${group.missing.join(", ")}.`);
    const matches = catalog.filter(product => imageSlug(product.name) === group.slug || product.slug === group.slug);
    if (matches.length === 1) group.matched = matches[0].slug;
    else if (matches.length > 1) group.issues.push("Ambiguous catalog match.");
  }
  const result = [...groups.values()];
  for (const group of result) {
    if (group.matched && result.filter(other => other.matched === group.matched).length > 1) group.issues.push("Multiple image groups match the same catalog product.");
  }
  return { groups: result, issues, ignored };
}

/** Reject links/junctions before reading or writing; never walk outside this root. */
async function safePath(root: string, path: string) {
  const rel = relative(root, path);
  if (rel.startsWith(`..${sep}`) || rel === ".." || isAbsolute(rel)) throw new Error("Image path escaped the project root.");
  for (const part of [root, ...rel.split(sep).filter(Boolean).map((_, index, parts) => resolve(root, ...parts.slice(0, index + 1)))]) {
    try {
      if ((await lstat(part)).isSymbolicLink()) throw new Error("Image import refuses symbolic links or junctions.");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return path;
}

async function readOptional(path: string): Promise<Buffer | null> {
  try { return await readFile(path); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}

async function writeAtomic(root: string, path: string, data: Buffer) {
  await safePath(root, path);
  if ((await readOptional(path))?.equals(data)) return;
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, data, { flag: "wx" });
    await rename(temporary, path);
  } finally { await unlink(temporary).catch(error => { if (error.code !== "ENOENT") throw error; }); }
}

async function encode(input: Buffer) {
  // Read metadata first so animated/multipage inputs are rejected rather than silently truncated.
  const metadata = await sharp(input, { limitInputPixels: 80_000_000 }).metadata();
  if ((metadata.pages ?? 1) > 1) throw new Error("Animated or multipage input is unsupported.");
  let result;
  for (const quality of [90, 86, 82]) {
    const { data, info } = await sharp(input, { limitInputPixels: 80_000_000 })
      .autoOrient().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true, fastShrinkOnLoad: false })
      .webp({ quality, effort: 6, smartSubsample: true }).toBuffer({ resolveWithObject: true });
    result = { data, width: info.width, height: info.height, quality };
    if (data.length <= 250 * 1024) break;
  }
  // Never sacrifice detail below quality 82 merely to hit a byte target; never pad small images.
  return result!;
}

export async function importProductImages({ root: projectRoot, catalog }: { root: string; catalog: readonly CatalogIdentity[] }): Promise<ImportReport> {
  const root = resolve(projectRoot);
  const input = await safePath(root, resolve(root, "product-images-original"));
  const cacheFolder = await safePath(root, resolve(root, ".image-cache"));
  await mkdir(cacheFolder, { recursive: true });
  const lockPath = await safePath(root, resolve(cacheFolder, "import.lock"));
  const lock = await open(lockPath, "wx");
  try {
    const statePath = await safePath(root, resolve(cacheFolder, "state.json"));
    const previous = await readOptional(statePath);
    const state: { signature: string; entries: Record<string, CachedImage> } = previous ? JSON.parse(previous.toString()) : { signature, entries: {} };
    if (typeof state.entries !== "object" || state.entries === null) throw new Error("Invalid image cache. Review it before continuing.");
    const entries = await readdir(input, { withFileTypes: true });
    const scan = scanImageGroups(entries.filter(entry => entry.isFile()).map(entry => entry.name), catalog);
    for (const entry of entries.filter(entry => !entry.isFile())) scan.issues.push(`Non-file entry skipped: ${entry.name}`);
    const report: ImportReport = { ...scan, images: [], processed: 0, cached: 0, originalBytes: 0, optimizedBytes: 0, savingsPercent: 0 };
    const manifestPath = await safePath(root, resolve(root, "src/modules/catalog/imported-images.json"));
    const oldManifest = await readOptional(manifestPath);
    const galleries: Record<string, string[]> = {};
    for (const group of report.groups) {
      if (group.issues.length) continue;
      const pending: { data: Buffer; outputPath: string; entry: ImageResult }[] = [];
      let context = "input validation";
      try {
        for (const number of [1, 2, 3, 4]) {
          const source = group.files[number][0];
          context = `input path/size check for ${source}`;
          const sourcePath = await safePath(root, resolve(input, source));
          if ((await lstat(sourcePath)).size > 100 * 1024 * 1024) throw new Error("Input exceeds the 100 MiB safety limit.");
          const buffer = await readFile(sourcePath);
          const sourceHash = hash(buffer);
          const output = `/products/${group.slug}/${number}.webp`;
          const outputPath = await safePath(root, resolve(root, `public${output}`));
          const existing = await readOptional(outputPath);
          const cached = state.entries[output];
          const existingHash = existing ? hash(existing) : null;
          context = `output ownership check for image ${number} (restore its cache or review existing output)`;
          if (existing && (!cached || existingHash !== cached.outputHash)) throw new Error("Output exists without matching importer ownership; refusing to overwrite it.");
          if (existing && cached.signature === signature && cached.source === source && cached.sourceHash === sourceHash) {
            pending.push({ data: existing, outputPath, entry: { ...cached, output, cached: true } });
          } else {
            context = `image decoding/encoding for ${source} (check format, pixel limit and animation)`;
            const optimized = await encode(buffer);
            pending.push({ data: optimized.data, outputPath, entry: { signature, source, sourceHash, outputHash: hash(optimized.data), originalBytes: buffer.length, optimizedBytes: optimized.data.length, width: optimized.width, height: optimized.height, quality: optimized.quality, output, cached: false } });
          }
        }
      } catch {
        group.issues.push(`Failed ${context}. Entire group skipped.`);
        continue;
      }
      // Only a complete, validated group can update a gallery. No partial gallery publication.
      for (const item of pending) {
        await writeAtomic(root, item.outputPath, item.data);
        const { output, cached: wasCached, ...cache } = item.entry;
        state.entries[output] = cache;
        report.images.push(item.entry);
        if (wasCached) report.cached++; else report.processed++;
      }
      if (group.matched) galleries[group.matched] = pending.map(item => item.entry.output);
    }
    // Any invalid input aborts catalog manifest updates, preserving the previous gallery bindings.
    if (!report.issues.length && report.groups.every(group => !group.issues.length)) {
      await writeAtomic(root, manifestPath, Buffer.from(JSON.stringify(galleries, null, 2) + "\n"));
    } else if (!oldManifest) {
      await writeAtomic(root, manifestPath, Buffer.from("{}\n"));
    }
    state.signature = signature;
    await writeAtomic(root, statePath, Buffer.from(JSON.stringify(state, null, 2) + "\n"));
    report.originalBytes = report.images.reduce((sum, item) => sum + item.originalBytes, 0);
    report.optimizedBytes = report.images.reduce((sum, item) => sum + item.optimizedBytes, 0);
    report.savingsPercent = report.originalBytes ? Number(((1 - report.optimizedBytes / report.originalBytes) * 100).toFixed(2)) : 0;
    await writeAtomic(root, resolve(cacheFolder, "report.json"), Buffer.from(JSON.stringify(report, null, 2) + "\n"));
    return report;
  } finally { await lock.close(); await unlink(lockPath); }
}
