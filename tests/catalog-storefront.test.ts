import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { products } from "../src/modules/catalog/products";
import type { Product } from "../src/modules/catalog/types";
import { defaultFilters, filterProducts, readFilters, filterQuery, relatedProducts } from "../src/modules/catalog/filters";
import { categoryDetails, getCategory, categoryHref } from "../src/modules/catalog/categories";
import { isOrderableProduct, productEnquiryUrl, productDetailsEnquiryUrl } from "../src/modules/catalog/presentation";
import { publicOrigin, publicPageUrl } from "../src/lib/urls";
import { storefrontRobots, storefrontSitemap } from "../src/modules/storefront/seo";
import { policies, getPolicy } from "../src/modules/storefront/policies";
import { generalEnquiryUrl } from "../src/lib/whatsapp";
import { site } from "../src/lib/site";

// Synthetic catalog fixtures only. These never enter published business data.
function fixture(patch: Partial<Product> = {}): Product {
  return { ...products[0], id: "test-a", slug: "test-a", name: "Alpha test component", brand: "Fixture A", isSample: false, stockStatus: "in-stock", pricePkr: 2000,
    specifications: [{ name: "Interface", value: "Test socket" }], ...patch };
}
const catalog = [fixture(), fixture({ id: "test-b", slug: "test-b", name: "Beta test component", category: "Memory", brand: "Fixture B", stockStatus: "on-request", pricePkr: 1000 }), fixture({ id: "test-c", slug: "test-c", name: "Gamma test component", pricePkr: null, stockStatus: "unconfirmed" })];

test("approved WhatsApp contact opens general chat while sample orders and indexing stay disabled", () => {
  assert.equal(site.whatsappNumber, "923109806478");
  const chat = new URL(generalEnquiryUrl()!);
  assert.equal(chat.origin, "https://wa.me");
  assert.equal(chat.pathname, "/923109806478");
  assert.match(chat.searchParams.get("text")!, /question about PC hardware/);
  assert.doesNotMatch(chat.searchParams.get("text")!, /Product ID\/SKU:|order confirmed|paid/i);
  assert.equal(site.preview, true);
  assert.deepEqual(storefrontSitemap(site.url, site.preview, products), []);
  for (const product of products.filter(product => product.isSample)) assert.equal(productEnquiryUrl(product, site.whatsappNumber, "https://store.example"), null);
});

test("approved available product enquiries use the official number and encode full manual-order details", () => {
  const product = fixture({ name: "Fixture A&B #1", id: "fixture/id+1" });
  for (const stockStatus of ["in-stock", "on-request"] as const) {
    const link = new URL(productEnquiryUrl({ ...product, stockStatus }, site.whatsappNumber, "https://store.example")!);
    assert.equal(link.origin, "https://wa.me");
    assert.equal(link.pathname, "/923109806478");
    assert.equal(link.searchParams.size, 1);
    const message = link.searchParams.get("text")!;
    for (const value of [product.name, product.id, "PKR", "2,000", "https://store.example/products/test-a", "current stock", "delivery charges", "payment details and instructions", "confirm", "not a confirmed or paid order"]) assert.ok(message.includes(value));
  }
  assert.equal(productEnquiryUrl(product, site.whatsappNumber, null), null);
});

test("search matches names, SKU, category, brand and specifications without case sensitivity", () => {
  for (const query of ["  ALPHA ", "test-a", "graphics", "fixture a", "test socket"]) {
    const matches = filterProducts(catalog, { ...defaultFilters, query });
    assert.ok(matches.some((product) => product.id === "test-a"));
  }
  assert.deepEqual(filterProducts(catalog, { ...defaultFilters, query: "no-match-anywhere" }), []);
});

test("photo-discovered Z890 is searchable with four ordered images and unverified metadata", () => {
  const product = products.find(product => product.slug === "z890-aorus-pro-ice")!;
  assert.ok(product);
  for (const query of ["Aorus", "Z890", "Ice", "aOrUs"]) assert.ok(filterProducts(products, { ...defaultFilters, query }).includes(product));
  assert.deepEqual(product.images.map(image => image.src), [1, 2, 3, 4].map(n => `/products/z890-aorus-pro-ice/${n}.webp`));
  assert.equal(product.images[0].src, "/products/z890-aorus-pro-ice/1.webp");
  assert.equal(product.category, null);
  assert.equal(filterProducts(products, { ...defaultFilters, category: "Memory" }).includes(product), false);
  assert.equal(product.pricePkr, null);
  assert.equal(product.stockStatus, "unconfirmed");
  assert.equal(isOrderableProduct(product), false);
  assert.equal(productEnquiryUrl(product, site.whatsappNumber, "https://store.example"), null);
  const message = new URL(productDetailsEnquiryUrl(product, site.whatsappNumber, "https://store.example")!).searchParams.get("text")!;
  for (const value of [product.name, product.id, "price and current availability", "https://store.example/products/z890-aorus-pro-ice", "not a confirmed or paid order"]) assert.ok(message.includes(value));
  assert.doesNotMatch(message, /I would like to order|Price:|In stock/);
  assert.equal(productDetailsEnquiryUrl(product, null), null);
  assert.equal(productDetailsEnquiryUrl({ ...product, isSample: true }, site.whatsappNumber), null);
});

test("category, brand and availability filters compose and reset predictably", () => {
  assert.deepEqual(filterProducts(catalog, { ...defaultFilters, category: "Memory", brand: "Fixture B", availability: "on-request" }).map(p => p.id), ["test-b"]);
  assert.equal(filterProducts(catalog, { ...defaultFilters, category: "Memory", availability: "in-stock" }).length, 0);
  assert.equal(filterProducts(catalog, defaultFilters).length, 3);
  assert.equal(filterProducts(products, { ...defaultFilters, availability: "in-stock" }).length, 0);
});

test("price sorting keeps unpriced items last in both directions and never mutates catalog", () => {
  const original = catalog.map(p => p.id);
  assert.deepEqual(filterProducts(catalog, { ...defaultFilters, sort: "price-asc" }).map(p => p.id), ["test-b", "test-a", "test-c"]);
  assert.deepEqual(filterProducts(catalog, { ...defaultFilters, sort: "price-desc" }).map(p => p.id), ["test-a", "test-b", "test-c"]);
  assert.deepEqual(catalog.map(p => p.id), original);
  assert.deepEqual(filterProducts([fixture({ featured: false, name: "A" }), fixture({ id: "featured", featured: true, name: "Z" })], defaultFilters).map(p => p.id), ["featured", "test-a"]);
});

test("filter URLs round-trip Unicode and reserved characters without injecting parameters", () => {
  const filters = { ...defaultFilters, query: "A&B + اردو ?", category: "Memory" as const, brand: "Fixture B", availability: "on-request" as const, sort: "price-desc" as const };
  const params = new URLSearchParams(filterQuery(filters));
  assert.deepEqual(readFilters(params, catalog), filters);
  assert.equal(params.size, 5);
  assert.equal(filterQuery(defaultFilters), "");
});

test("invalid URL filters fail to safe defaults; category pages cannot escape their scope", () => {
  assert.deepEqual(readFilters(new URLSearchParams("category=unknown&brand=unknown&sort=__proto__&availability=paid"), catalog), defaultFilters);
  const scoped = readFilters(new URLSearchParams("category=Storage&q=Beta"), catalog, "Memory");
  assert.equal(scoped.category, "Memory");
  assert.equal(filterQuery(scoped, "Memory"), "q=Beta");
  assert.equal(readFilters(new URLSearchParams({ q: "x".repeat(2000) }), catalog).query.length, 120);
});

test("related listings exclude the current item and prioritize its category", () => {
  const result = relatedProducts(catalog[0], catalog, 1);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "test-c");
  assert.equal(result.some(p => p.id === "test-a"), false);
  assert.deepEqual(relatedProducts(catalog[0], [catalog[0]]), []);
});

test("order enquiries contain full product details and explicitly require manual confirmation", () => {
  const url = new URL(productEnquiryUrl(fixture({ name: "A&B test component" }), "+12025550123", "https://store.example")!);
  const message = url.searchParams.get("text")!;
  for (const text of ["A&B test component", "Product ID/SKU: test-a", "PKR", "2,000", "https://store.example/products/test-a", "current stock", "delivery charges", "payment details", "confirm", "not a confirmed or paid order"]) assert.ok(message.includes(text));
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.searchParams.size, 1);
});

test("orders fail closed for samples, unknown availability/prices, missing contact or domain", () => {
  for (const patch of [{ isSample: true }, { stockStatus: "out-of-stock" as const }, { stockStatus: "unconfirmed" as const }, { pricePkr: null }, { pricePkr: -1 }, { pricePkr: Number.NaN }]) {
    assert.equal(isOrderableProduct(fixture(patch)), false);
    assert.equal(productEnquiryUrl(fixture(patch), "+12025550123", "https://store.example"), null);
  }
  assert.equal(productEnquiryUrl(fixture(), null, "https://store.example"), null);
  assert.equal(productEnquiryUrl(fixture(), "+12025550123", null), null);
  assert.ok(productEnquiryUrl(fixture({ stockStatus: "on-request" }), "+12025550123", "https://store.example"));
});

test("public origins reject credentials, insecure schemes and redirects without echoing values", () => {
  assert.equal(publicOrigin(null), null);
  assert.equal(publicOrigin("https://store.example/"), "https://store.example");
  for (const value of ["http://store.example", "javascript:alert(1)", "https://secret:password@store.example", "https://store.example/path", "https://store.example?token=sensitive", "https://store.example/#fragment", "https://127.0.0.1", "https://store.local", "https://store.example:8443"]) {
    assert.throws(() => publicOrigin(value), (error: unknown) => { assert.ok(error instanceof Error); assert.doesNotMatch(error.message, /password|sensitive|8443/); return true; });
  }
  for (const path of ["//evil.example", "https://evil.example", "/\\evil.example", "/\r\nevil"]) assert.throws(() => publicPageUrl(path, "https://store.example"));
});

test("sitemap contains only approved public content and omits previews, samples and draft policies", () => {
  assert.deepEqual(storefrontSitemap(null, false, catalog), []);
  assert.deepEqual(storefrontSitemap("https://store.example", true, catalog), []);
  const urls = storefrontSitemap("https://store.example", false, [...catalog, ...products]).map(p => p.url);
  assert.ok(urls.includes("https://store.example/shop"));
  assert.ok(urls.includes("https://store.example/products/test-a"));
  assert.ok(urls.includes("https://store.example/categories/memory"));
  for (const url of urls) assert.doesNotMatch(url, /sample-|\/policies\/|\/auth|\/admin/);
});

test("robots block preview stores and private paths while letting policy noindex be read", () => {
  assert.deepEqual(storefrontRobots(null, false).rules, { userAgent: "*", disallow: "/" });
  assert.deepEqual(storefrontRobots("https://store.example", true).rules, { userAgent: "*", disallow: "/" });
  const robots = storefrontRobots("https://store.example", false);
  assert.equal(robots.sitemap, "https://store.example/sitemap.xml");
  assert.deepEqual(robots.rules, { userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/api"] });
});

test("category routes map exactly and unknown category/policy slugs have no fallback", () => {
  for (const category of categoryDetails) { assert.equal(getCategory(category.slug), category); assert.equal(categoryHref(category.name), `/categories/${category.slug}`); }
  assert.equal(getCategory("../admin"), undefined);
  assert.equal(getPolicy("unknown"), undefined);
  assert.deepEqual(policies.map(p => p.slug), ["shipping", "returns", "privacy", "terms"]);
});

test("self-hosted font assets are present with an open font license", () => {
  for (const weight of [400, 500, 600, 700]) assert.equal(readFileSync(`public/fonts/poppins-latin-${weight}.woff2`).subarray(0, 4).toString(), "wOF2");
  assert.match(readFileSync("public/fonts/OFL-Poppins.txt", "utf8"), /SIL OPEN FONT LICENSE/);
});
