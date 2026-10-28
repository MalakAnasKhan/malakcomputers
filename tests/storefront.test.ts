import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import ts from "typescript";
import { getProduct, products, validateCatalog } from "../src/modules/catalog/products";
import { formatPrice, productEnquiryUrl } from "../src/modules/catalog/presentation";
import { whatsappUrl } from "../src/lib/whatsapp";
import { site } from "../src/lib/site";
import { publicOrigin } from "../src/lib/urls";

// Synthetic test numbers only: never rendered in site settings or catalog data.
const testNumber = "+12025550123";

test("catalog is valid and samples are explicit, unpriced, and cannot accept orders", () => {
  validateCatalog(products);
  assert.ok(products.length > 0);
  for (const product of products) {
    if (product.isSample) {
      assert.match(product.name, /sample/i);
      assert.equal(product.pricePkr, null);
      assert.equal(product.stockStatus, "unconfirmed");
      assert.equal(productEnquiryUrl(product, testNumber), null);
    }
    assert.equal(getProduct(product.slug), product);
    for (const image of product.images) assert.ok(existsSync(`public${image.src}`));
  }
  assert.equal(getProduct("missing-product"), undefined);
  assert.equal(getProduct("../../auth/login"), undefined);
});

test("catalog rejects duplicates, unsafe images/slugs and invented sample prices", () => {
  const sample = { ...products[0], isSample: true, pricePkr: null, stockStatus: "unconfirmed" as const };
  assert.throws(() => validateCatalog([sample, sample]));
  for (const patch of [
    { slug: "../admin" }, { pricePkr: -1 }, { pricePkr: 1.5 }, { pricePkr: Number.NaN },
    { pricePkr: 100 }, { stockStatus: "in-stock" as const }, { name: "" },
    { images: [{ src: "https://unapproved.example/image.jpg", alt: "Example" }] as const },
    { images: [{ src: "/images/catalog/../secret.svg", alt: "Example" }] as const },
    { images: [{ src: "/images/catalog/sample-gpu.svg", alt: "" }] as const },
  ]) assert.throws(() => validateCatalog([{ ...sample, ...patch }]));
});

test("WhatsApp links use a fixed HTTPS host and round-trip encoded messages", () => {
  const message = "Question: A&B / + #?\nاردو";
  const url = new URL(whatsappUrl(testNumber, message)!);
  assert.equal(url.protocol, "https:");
  assert.equal(url.hostname, "wa.me");
  assert.equal(url.pathname, "/12025550123");
  assert.equal(url.searchParams.get("text"), message);
  assert.equal(url.searchParams.size, 1);
  assert.equal(url.hash, "");
  assert.equal(whatsappUrl(testNumber.slice(1), message), url.href);
});

test("WhatsApp links fail safely for missing or malformed contact details", () => {
  assert.equal(whatsappUrl(null, "Hello"), null);
  assert.equal(whatsappUrl("", "Hello"), null);
  for (const number of ["03001234567", "++12025550123", "12025550123?text=bad", "https://evil.example", " 12025550123", "+1 202 555 0123", "12025550123\n", "1234567", "1234567890123456"]) {
    assert.throws(() => whatsappUrl(number, "Hello"));
  }
  assert.throws(() => whatsappUrl(testNumber, " "));
  assert.throws(() => whatsappUrl(testNumber, "x".repeat(2001)));
});

test("only non-sample, available catalog entries can generate an enquiry", () => {
  const fixture = { ...products[0], id: "test-only", name: "Offline test item & cable", isSample: false, pricePkr: 12000, stockStatus: "in-stock" as const };
  assert.doesNotThrow(() => validateCatalog([fixture]));
  const url = new URL(productEnquiryUrl(fixture, testNumber, "https://store.example")!);
  assert.match(url.searchParams.get("text")!, /Offline test item & cable/);
  assert.match(url.searchParams.get("text")!, /Product ID\/SKU: test-only/);
  assert.match(url.searchParams.get("text")!, /12,000/);
  assert.equal(productEnquiryUrl(fixture, null), null);
  assert.equal(productEnquiryUrl({ ...fixture, stockStatus: "out-of-stock" }, testNumber, "https://store.example"), null);
  assert.equal(formatPrice(null), "Price on request");
  assert.match(formatPrice(12000), /12,000/);
});

test("launch cannot index sample products or enable enquiries without a validated number", () => {
  for (const product of products.filter(product => product.isSample)) assert.equal(productEnquiryUrl(product, testNumber), null);
  if (!site.preview) {
    assert.ok(site.whatsappNumber, "An approved WhatsApp number is required for launch.");
    assert.ok(publicOrigin(site.url), "An approved public domain is required for launch.");
  }
  const url = whatsappUrl(site.whatsappNumber, "Offline contact configuration check");
  assert.equal(url === null, site.whatsappNumber === null || site.whatsappNumber.trim() === "");
  for (const social of site.socials) assert.equal(new URL(social.url).protocol, "https:");
});

test("public TypeScript dependency graph cannot reach backend or environment modules", () => {
  const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
  assert.equal(config.error, undefined);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const paths = program.getSourceFiles().map((file) => file.fileName.replaceAll("\\", "/"));
  for (const path of paths.filter((path) => !path.includes("/node_modules/") && !path.endsWith("storefront.test.ts"))) {
    assert.doesNotMatch(path, /(?:backend-preserved|src\/(?:generated|lib\/(?:prisma|env|supabase)|modules\/(?:auth|access-control))|config\/(?:development-environment|supabase-projects))\//);
    if (path.endsWith("/src/lib/prisma.ts")) assert.fail("Public compilation imported Prisma.");
  }
});

test("auth/admin routes and session proxy are absent from active Next routes", () => {
  assert.equal(existsSync("src/proxy.ts"), false);
  assert.equal(existsSync("src/app/(auth)"), false);
  assert.equal(existsSync("src/app/(admin)"), false);
});

test("public install/build/typecheck do not trigger Prisma", () => {
  const scripts = JSON.parse(readFileSync("package.json", "utf8")).scripts;
  for (const hook of ["postinstall", "prepare", "prebuild"]) assert.equal(scripts[hook], undefined);
  assert.equal(scripts.pretypecheck, "next typegen");
  assert.equal(scripts.build, "next build");
  assert.equal(scripts.typecheck, "tsc --noEmit");
});
