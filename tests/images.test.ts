import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, stat, unlink } from "node:fs/promises";
import { resolve, sep } from "node:path";
import sharp from "sharp";
import { importProductImages, scanImageGroups } from "../scripts/image-importer";
import { applyImageGalleries } from "../src/modules/catalog/image-galleries";
import { products, validateCatalog } from "../src/modules/catalog/products";
import { productEnquiryUrl } from "../src/modules/catalog/presentation";

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

test("unmatched complete groups get images but cannot create catalog products or approval data", async () => {
  await fixture(async root => {
    await originals(root, "Unknown board");
    const report = await importProductImages({ root, catalog });
    assert.equal(report.processed, 4);
    assert.equal(report.groups[0].matched, null);
    assert.deepEqual(JSON.parse(await readFile(resolve(root, "src/modules/catalog/imported-images.json"), "utf8")), {});
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
