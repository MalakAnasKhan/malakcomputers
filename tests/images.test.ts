import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, stat, unlink } from "node:fs/promises";
import { resolve, sep } from "node:path";
import sharp from "sharp";
import { importProductImages, scanImageGroups } from "../scripts/image-importer";
import { applyImageGalleries } from "../src/modules/catalog/image-galleries";
import { products, validateCatalog } from "../src/modules/catalog/products";
import { productEnquiryUrl } from "../src/modules/catalog/presentation";
import { mergeDiscoveredProducts, validateDiscoveries } from "../src/modules/catalog/discovery";

const catalog = [{ name: "Fixture Board", slug: "fixture-board" }];
const filenames = (name = "Fixture Board") => [4, 2, 1, 3].map(number => `${name} ${number}.png`);
async function fixture(run: (root: string) => Promise<void>) {
  const base = resolve(".storefront-check");
  await mkdir(base, { recursive: true });
  const root = await mkdtemp(resolve(base, "image-tests-"));
  try {
    await mkdir(resolve(root, "product-images-original"));
    await mkdir(resolve(root, "src/modules/catalog"), { recursive: true });
    await run(root);
  } finally {
    assert.ok(root.startsWith(base + sep) && root !== base);
    await rm(root, { recursive: true, force: true });
  }
}
async function originals(root: string, name = "Fixture Board") {
  for (const number of [1, 2, 3, 4]) {
    const buffer = await sharp({ create: { width: number === 2 ? 32 : 1600, height: number === 2 ? 20 : 800, channels: 4, background: { r: 60, g: 80, b: 100, alpha: 0.7 } } }).png().toBuffer();
    await writeFile(resolve(root, `product-images-original/${name} ${number}.png`), buffer);
  }
}

test("image grouping sorts numerical slots and matches only unique names or slugs", () => {
  const result = scanImageGroups(filenames(), catalog);
  assert.equal(result.groups.length, 1);
  assert.equal(result.groups[0].matched, "fixture-board");
  assert.deepEqual(result.groups[0].missing, []);
  assert.equal(result.groups[0].files[1][0], "Fixture Board 1.png");
  assert.equal(scanImageGroups(filenames("fixture-board"), catalog).groups[0].matched, "fixture-board");
  assert.equal(scanImageGroups(filenames("Unapproved board"), catalog).groups[0].matched, null);
});

test("missing, duplicate, ambiguous filenames and normalized slug collisions fail closed", () => {
  const missing = scanImageGroups(filenames().filter(name => !name.endsWith("3.png")), catalog).groups[0];
  assert.deepEqual(missing.missing, [3]);
  assert.match(missing.issues.join(), /Missing/);
  assert.match(scanImageGroups([...filenames(), "Fixture Board 1.jpg"], catalog).groups[0].issues.join(), /Duplicate/);
  assert.equal(scanImageGroups(["Fixture Board.png", "Fixture Board 5.png", "Fixture Board1.jpg"], catalog).issues.length, 3);
  const collisions = scanImageGroups([...filenames("Fixture Board"), ...filenames("fixture-board")], catalog);
  assert.ok(collisions.groups.every(group => group.issues.some(issue => issue.includes("same output slug"))));
  const ambiguous = scanImageGroups(filenames(), [...catalog, { name: "Fixture Board", slug: "second-board" }]);
  assert.match(ambiguous.groups[0].issues.join(), /Ambiguous catalog/);
  assert.deepEqual(scanImageGroups(["notes.txt", "Drawing.svg"], catalog).ignored, ["Drawing.svg", "notes.txt"]);
});

test("Sharp import fits inside 1200, never enlarges, preserves originals, caches, and binds four ordered images", async () => {
  await fixture(async root => {
    await originals(root);
    const originalPath = resolve(root, "product-images-original/Fixture Board 1.png");
    const original = await readFile(originalPath);
    const before = await stat(originalPath);
    const report = await importProductImages({ root, catalog });
    assert.equal(report.processed, 4);
    assert.equal(report.cached, 0);
    assert.equal(report.images.length, 4);
    assert.ok(report.optimizedBytes < report.originalBytes);
    assert.deepEqual(await readFile(originalPath), original);
    assert.equal((await stat(originalPath)).mtimeMs, before.mtimeMs);
    assert.deepEqual(report.images.map(image => [image.width, image.height]), [[1200, 600], [32, 20], [1200, 600], [1200, 600]]);
    const output = resolve(root, "public/products/fixture-board/1.webp");
    const metadata = await sharp(await readFile(output)).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.hasAlpha, true);
    assert.equal(metadata.exif, undefined);
    const manifest = JSON.parse(await readFile(resolve(root, "src/modules/catalog/imported-images.json"), "utf8"));
    assert.deepEqual(manifest["fixture-board"], [1, 2, 3, 4].map(n => `/products/fixture-board/${n}.webp`));
    const outputStat = await stat(output);
    const second = await importProductImages({ root, catalog });
    assert.equal(second.processed, 0);
    assert.equal(second.cached, 4);
    assert.equal((await stat(output)).mtimeMs, outputStat.mtimeMs);
    // Content changes, not just timestamps, invalidate exactly the affected image.
    await writeFile(originalPath, await sharp({ create: { width: 48, height: 24, channels: 3, background: "red" } }).png().toBuffer());
    const changed = await importProductImages({ root, catalog });
    assert.equal(changed.processed, 1);
    assert.equal(changed.cached, 3);
    await unlink(output);
    const deleted = await importProductImages({ root, catalog });
    assert.equal(deleted.processed, 1);
    assert.equal(deleted.cached, 3);
  });
});

test("unmatched complete groups create deterministic discovery entries without business facts", async () => {
  await fixture(async root => {
    await originals(root, "Unknown board");
    const report = await importProductImages({ root, catalog });
    assert.equal(report.processed, 4);
    assert.equal(report.groups[0].matched, null);
    assert.deepEqual(JSON.parse(await readFile(resolve(root, "src/modules/catalog/imported-images.json"), "utf8")), {});
    const path = resolve(root, "src/modules/catalog/discovered-products.json");
    const bytes = await readFile(path, "utf8");
    const entries = JSON.parse(bytes);
    assert.deepEqual(entries, [{ id: "image-unknown-board", slug: "unknown-board", name: "Unknown board", images: [1, 2, 3, 4].map(n => `/products/unknown-board/${n}.webp`) }]);
    assert.deepEqual(report.discovered, entries);
    const product = mergeDiscoveredProducts([], entries)[0];
    assert.equal(product.pricePkr, null);
    assert.equal(product.stockStatus, "unconfirmed");
    assert.equal(product.category, null);
    assert.equal(product.brand, "Not specified");
    assert.equal(product.description, "");
    assert.deepEqual(product.specifications, []);
    assert.equal(product.isSample, false);
    assert.equal(productEnquiryUrl(product, "+12025550123", "https://store.example"), null);
    validateCatalog([product]);
    assert.match(report.warnings.join(), /await approved/);
    const again = await importProductImages({ root, catalog });
    assert.equal(again.processed, 0);
    assert.equal(again.cached, 4);
    assert.equal(await readFile(path, "utf8"), bytes);
    for (const number of [1, 2, 3, 4]) await unlink(resolve(root, `product-images-original/Unknown board ${number}.png`));
    const absent = await importProductImages({ root, catalog });
    assert.equal(absent.discovered.length, 1);
    assert.match(absent.warnings.join(), /originals absent/);
    assert.equal(await readFile(path, "utf8"), bytes);
    assert.ok((await stat(resolve(root, "public/products/unknown-board/1.webp"))).size > 0);
  });
});

test("case differences share a group but punctuation conflicts and non-space suffixes fail closed", () => {
  const scan = scanImageGroups(["Aorus Ice 1.PNG", "aorus ice 2.jpg", "AORUS ICE 3.webp", "Aorus Ice 4.png"], []);
  assert.equal(scan.groups.length, 1);
  assert.deepEqual(scan.groups[0].issues, []);
  assert.equal(scanImageGroups(["Aorus Ice-1.png", "Aorus Ice_2.png"], []).issues.length, 2);
  assert.equal(scanImageGroups([...filenames("Aorus+Ice"), ...filenames("Aorus Ice")], []).groups.filter(g => g.issues.length).length, 2);
  assert.equal(scanImageGroups([...filenames("Aorus Ice"), ...filenames("Aorus Ice ")], []).groups.filter(g => g.issues.length).length, 2);
});

test("manual catalog identity and all metadata survive discovery, including later approvals", () => {
  const entry = { id: "image-fixture-board", slug: "fixture-board", name: "Fixture Board", images: [1, 2, 3, 4].map(n => `/products/fixture-board/${n}.webp`) };
  const manual = { ...products[0], id: "approved-sku", slug: "existing-canonical-url", name: "Fixture Board", brand: "Approved fixture brand", category: "Memory" as const, description: "Approved fixture description", pricePkr: 1200, stockStatus: "in-stock" as const, isSample: false };
  const merged = mergeDiscoveredProducts([manual], [entry]);
  assert.equal(merged.length, 1);
  const { images: oldImages, ...before } = manual;
  const { images: newImages, ...after } = merged[0];
  assert.deepEqual(before, after);
  assert.notDeepEqual(oldImages, newImages);
  assert.deepEqual(newImages.map(image => image.src), entry.images);
  assert.throws(() => mergeDiscoveredProducts([manual, { ...manual, id: "another", slug: "another" }], [entry]), /Ambiguous/);
  assert.throws(() => mergeDiscoveredProducts([{ ...manual, id: entry.id, name: "Unrelated product" }], [entry]), /unrelated/);
  assert.match(scanImageGroups(filenames(), [{ id: entry.id, name: "Unrelated product", slug: "unrelated" }]).groups[0].issues.join(), /unrelated/);
  for (const invalid of [[entry, entry], [{ ...entry, pricePkr: 1200 }], [{ ...entry, slug: "../escape" }], [{ ...entry, images: [...entry.images].reverse() }]]) assert.throws(() => validateDiscoveries(invalid));
});

test("new imports preserve previous galleries, reject historical slug conflicts and retain invalid groups", async () => {
  await fixture(async root => {
    await originals(root, "Fixture+Board");
    await importProductImages({ root, catalog: [] });
    const generated = resolve(root, "src/modules/catalog/discovered-products.json");
    const before = await readFile(generated, "utf8");
    for (const n of [1, 2, 3, 4]) await unlink(resolve(root, `product-images-original/Fixture+Board ${n}.png`));
    await originals(root);
    const conflict = await importProductImages({ root, catalog: [] });
    assert.match(conflict.groups[0].issues.join(), /previously discovered slug/);
    assert.equal(await readFile(generated, "utf8"), before);
  });
  await fixture(async root => {
    await originals(root);
    await importProductImages({ root, catalog });
    const path = resolve(root, "src/modules/catalog/imported-images.json");
    const before = await readFile(path, "utf8");
    for (const n of [1, 2, 3, 4]) await unlink(resolve(root, `product-images-original/Fixture Board ${n}.png`));
    await originals(root, "Next Board");
    await importProductImages({ root, catalog });
    assert.equal(await readFile(path, "utf8"), before);
    assert.equal(JSON.parse(await readFile(resolve(root, "src/modules/catalog/discovered-products.json"), "utf8"))[0].name, "Next Board");
    await unlink(resolve(root, "product-images-original/Next Board 4.png"));
    const incomplete = await importProductImages({ root, catalog });
    assert.deepEqual(incomplete.groups[0].missing, [4]);
    assert.equal(incomplete.discovered.length, 1);
  });
});

test("incomplete/corrupt groups publish no gallery and do not overwrite existing output files", async () => {
  await fixture(async root => {
    await originals(root);
    const manifestPath = resolve(root, "src/modules/catalog/imported-images.json");
    const previous = '{"previous":["keep"]}\n';
    await writeFile(manifestPath, previous);
    await unlink(resolve(root, "product-images-original/Fixture Board 4.png"));
    const missing = await importProductImages({ root, catalog });
    assert.equal(missing.processed, 0);
    assert.deepEqual(missing.groups[0].missing, [4]);
    await writeFile(resolve(root, "product-images-original/Fixture Board 4.png"), "not an image");
    const corrupt = await importProductImages({ root, catalog });
    assert.equal(corrupt.processed, 0);
    assert.ok(corrupt.groups[0].issues.length);
    assert.equal(await readFile(manifestPath, "utf8"), previous);
    await originals(root);
    const output = resolve(root, "public/products/fixture-board/1.webp");
    await mkdir(resolve(root, "public/products/fixture-board"), { recursive: true });
    await writeFile(output, "hand-maintained output");
    const conflict = await importProductImages({ root, catalog });
    assert.equal(conflict.processed, 0);
    assert.ok(conflict.groups[0].issues.length);
    assert.equal(await readFile(output, "utf8"), "hand-maintained output");
  });
});

test("EXIF orientation is applied before resizing and private metadata is stripped", async () => {
  await fixture(async root => {
    await originals(root);
    const rotated = await sharp({ create: { width: 1600, height: 800, channels: 3, background: "white" } }).jpeg().withMetadata({ orientation: 6 }).toBuffer();
    await writeFile(resolve(root, "product-images-original/Fixture Board 1.png"), rotated);
    const report = await importProductImages({ root, catalog });
    assert.equal(report.images[0].width, 600);
    assert.equal(report.images[0].height, 1200);
    const metadata = await sharp(await readFile(resolve(root, "public/products/fixture-board/1.webp"))).metadata();
    assert.equal(metadata.orientation, undefined);
    assert.equal(metadata.exif, undefined);
  });
});

test("tampered output is preserved and a concurrent importer lock prevents all processing", async () => {
  await fixture(async root => {
    await originals(root);
    await importProductImages({ root, catalog });
    const output = resolve(root, "public/products/fixture-board/1.webp");
    const manifest = resolve(root, "src/modules/catalog/imported-images.json");
    const previous = await readFile(manifest);
    await writeFile(output, "manually changed");
    const report = await importProductImages({ root, catalog });
    assert.equal(report.processed, 0);
    assert.match(report.groups[0].issues.join(), /output ownership/);
    assert.equal(await readFile(output, "utf8"), "manually changed");
    assert.deepEqual(await readFile(manifest), previous);
    const lock = resolve(root, ".image-cache/import.lock");
    await writeFile(lock, "fixture lock");
    await assert.rejects(importProductImages({ root, catalog }), { code: "EEXIST" });
    assert.equal(await readFile(lock, "utf8"), "fixture lock");
  });
});

test("gallery binding changes only images and rejects unsafe or unordered paths", () => {
  const sample = products[0];
  const paths = [1, 2, 3, 4].map(n => `/products/fixture-board/${n}.webp`);
  const result = applyImageGalleries([sample], { [sample.slug]: paths })[0];
  assert.deepEqual(result.images.map(image => image.src), paths);
  const { images: oldImages, ...oldData } = sample;
  const { images: newImages, ...newData } = result;
  assert.equal(oldImages.length, sample.images.length);
  assert.equal(newImages.length, 4);
  assert.deepEqual(newData, oldData);
  validateCatalog([result]);
  assert.equal(productEnquiryUrl(result, "+12025550123", "https://fixture.example"), null);
  for (const invalid of [paths.slice(0, 3), [...paths].reverse(), paths.map(p => `https://bad.example${p}`), paths.map(p => p.replace("fixture-board", "../secret"))]) {
    assert.throws(() => applyImageGalleries([sample], { [sample.slug]: invalid }));
  }
  assert.equal(applyImageGalleries([sample], { unknown: paths })[0], sample);
});
