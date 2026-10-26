import { fileURLToPath } from "node:url";
import { registerHooks } from "node:module";

// Declare these two local TypeScript modules as ESM without changing the application's
// package type or suppressing Node warnings. Node 24 performs native type stripping.
const modules = new Set([new URL("../src/modules/catalog/data.ts", import.meta.url).href, new URL("./image-importer.ts", import.meta.url).href]);
registerHooks({ load(url, context, nextLoad) {
  return nextLoad(url, modules.has(url) ? { ...context, format: "module-typescript" } : context);
} });

// Node 24 strips erasable TypeScript locally. No app environment or database client is loaded.
const root = fileURLToPath(new URL("../", import.meta.url));
try {
  const { catalogData } = await import("../src/modules/catalog/data.ts");
  const { importProductImages } = await import("./image-importer.ts");
  const report = await importProductImages({ root, catalog: catalogData });
  console.log(`Products identified: ${report.groups.length}`);
  for (const group of report.groups) {
    console.log(`${group.name}: ${group.matched ? `MATCHED → ${group.matched}` : "UNMATCHED (no catalog product created)"}`);
    console.log(`  Missing images: ${group.missing.length ? group.missing.join(", ") : "none"}`);
    for (const issue of group.issues) console.error(`  ISSUE: ${issue}`);
  }
  console.table(report.images.map(image => ({
    source: image.source, output: image.output,
    originalKB: (image.originalBytes / 1024).toFixed(1), optimizedKB: (image.optimizedBytes / 1024).toFixed(1),
    savings: `${((1 - image.optimizedBytes / image.originalBytes) * 100).toFixed(1)}%`,
    dimensions: `${image.width}×${image.height}`, quality: image.quality, action: image.cached ? "unchanged" : "processed",
  })));
  console.log(`Images processed: ${report.processed}; unchanged: ${report.cached}`);
  console.log(`Total: ${(report.originalBytes / 1024).toFixed(1)} KiB → ${(report.optimizedBytes / 1024).toFixed(1)} KiB (${report.savingsPercent}% saved).`);
  for (const issue of report.issues) console.error(`ISSUE: ${issue}`);
  if (report.ignored.length) console.log(`Unsupported files ignored: ${report.ignored.join(", ")}`);
  console.log("Detailed local report: .image-cache/report.json");
  if (report.issues.length || report.groups.some(group => group.issues.length)) process.exitCode = 1;
} catch {
  console.error("Image import stopped. Ensure the originals folder exists, no other importer is running, and cache/output paths are regular writable files. No catalog approval or business data was changed.");
  process.exitCode = 1;
}
