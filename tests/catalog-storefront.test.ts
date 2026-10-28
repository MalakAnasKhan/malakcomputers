import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { products, publicProducts } from "../src/modules/catalog/products";
import type { Product } from "../src/modules/catalog/types";
import { defaultFilters, filterProducts, readFilters, filterQuery, relatedProducts } from "../src/modules/catalog/filters";
import { categoryDetails, getCategory, categoryHref } from "../src/modules/catalog/categories";
import { isOrderableProduct, productEnquiryUrl, productDetailsEnquiryUrl } from "../src/modules/catalog/presentation";
import { publicOrigin, publicPageUrl } from "../src/lib/urls";
import { pageMetadata, storefrontRobots, storefrontSitemap } from "../src/modules/storefront/seo";
import { policies, getPolicy } from "../src/modules/storefront/policies";
import { generalEnquiryUrl } from "../src/lib/whatsapp";
import { site, directionsUrl } from "../src/lib/site";
import { isPreviewDeployment } from "../src/modules/storefront/deployment";
import { organizationStructuredData, productStructuredData, breadcrumbStructuredData, serializeStructuredData } from "../src/modules/storefront/structured-data";
import { ProductTrust } from "../src/modules/catalog/product-trust";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Synthetic catalog fixtures only. These never enter published business data.
function fixture(patch: Partial<Product> = {}): Product {
  return { ...products[0], id: "test-a", slug: "test-a", name: "Alpha test component", brand: "Fixture A", isSample: false, stockStatus: "in-stock", pricePkr: 2000,
    specifications: [{ name: "Interface", value: "Test socket" }], ...patch };
}
const catalog = [fixture(), fixture({ id: "test-b", slug: "test-b", name: "Beta test component", category: "Memory", brand: "Fixture B", stockStatus: "on-request", pricePkr: 1000 }), fixture({ id: "test-c", slug: "test-c", name: "Gamma test component", pricePkr: null, stockStatus: "unconfirmed" })];

test("approved business contact and public origin agree while sample ordering stays disabled", () => {
  assert.equal(site.whatsappNumber, "923109806478");
  const chat = new URL(generalEnquiryUrl()!);
  assert.equal(chat.origin, "https://wa.me");
  assert.equal(chat.pathname, "/923109806478");
  assert.match(chat.searchParams.get("text")!, /question about PC hardware/);
  assert.doesNotMatch(chat.searchParams.get("text")!, /Product ID\/SKU:|order confirmed|paid/i);
  assert.equal(site.preview, false);
  assert.equal(site.name, "Malak Computers");
  assert.equal(site.url, "https://malakcomputers.vercel.app");
  assert.equal(site.contact.phone?.replace(/\D/g, ""), site.whatsappNumber);
  assert.equal(site.contact.address, "Office # 01, CoWork Floor 1 of CFC Center, Bypass Mingora Swat, Khyber Pakhtunkhwa, Pakistan.");
  const map = new URL(directionsUrl()!);
  assert.equal(map.origin, "https://www.google.com");
  assert.equal(map.pathname, "/maps/search/");
  assert.equal(map.searchParams.get("query"), site.contact.address);
  assert.equal(map.searchParams.get("api"), "1");
  assert.equal(directionsUrl(null), null);
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
  for (const value of [product.name, product.id, "Current price", "Availability", "Product condition", "Warranty details", "Delivery charges to my city", "https://store.example/products/z890-aorus-pro-ice", "not a confirmed or paid order"]) assert.ok(message.includes(value));
  const actual = new URL(productDetailsEnquiryUrl(product, site.whatsappNumber)!).searchParams.get("text")!;
  assert.ok(actual.includes("Assalamualaikum Malak Computers!"));
  assert.ok(actual.includes(`${site.url}/products/${product.slug}`));
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

test("sitemap includes approved policies and real published products, excluding samples and unpublished content", () => {
  assert.deepEqual(storefrontSitemap(null, false, catalog), []);
  assert.deepEqual(storefrontSitemap("https://store.example", true, catalog), []);
  const urls = storefrontSitemap("https://store.example", false, [...catalog, ...products]).map(p => p.url);
  assert.ok(urls.includes("https://store.example/shop"));
  assert.ok(urls.includes("https://store.example/products/test-a"));
  assert.ok(urls.includes("https://store.example/categories/memory"));
  for (const policy of policies) assert.ok(urls.includes(`https://store.example/policies/${policy.slug}`));
  for (const url of urls) assert.doesNotMatch(url, /sample-|\/auth|\/admin/);
  assert.ok(!storefrontSitemap("https://store.example", false, [fixture({ published: false })]).some(item => item.url.includes("/products/")));
});

test("robots block preview stores and private paths without hiding sample noindex from crawlers", () => {
  assert.deepEqual(storefrontRobots(null, false).rules, { userAgent: "*", disallow: "/" });
  assert.deepEqual(storefrontRobots("https://store.example", true).rules, { userAgent: "*", disallow: "/" });
  const robots = storefrontRobots("https://store.example", false);
  assert.equal(robots.sitemap, "https://store.example/sitemap.xml");
  assert.deepEqual(robots.rules, { userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/api", "/docs", "/backend-preserved", "/prisma"] });
});

test("publication gates exclude unpublished listings from discovery, enquiries and structured data", () => {
  const hidden = fixture({ published: false });
  assert.deepEqual(publicProducts([hidden, catalog[0]]), [catalog[0]]);
  assert.equal(productEnquiryUrl(hidden, site.whatsappNumber), null);
  assert.equal(productDetailsEnquiryUrl(hidden, site.whatsappNumber), null);
  assert.equal(productStructuredData(hidden), null);
});

test("warranty claims require explicit product approval and never appear on samples", () => {
  const render = (product: Product) => renderToStaticMarkup(createElement(ProductTrust, { product }));
  assert.equal(render(fixture({ isSample: true, checkingWarrantyEligible: true })), "");
  const unknown = render(fixture());
  assert.match(unknown, /Ask about warranty coverage/);
  assert.doesNotMatch(unknown, /Eligible products include a 7-day/);
  assert.match(unknown, /Nationwide delivery across Pakistan/);
  assert.match(unknown, /Shipping is paid by the customer/);
  const approved = render(fixture({ checkingWarrantyEligible: true }));
  for (const text of ["7-Day Checking Warranty", "date of delivery", "electrical burning", "statutory consumer rights", "/policies/returns", "/policies/shipping"]) assert.ok(approved.includes(text));
  assert.match(render(fixture({ checkingWarrantyEligible: false })), /not eligible/);
});

test("production metadata uses canonical URLs, real images and explicit sample exclusion", () => {
  const metadata = pageMetadata("Fixture product", "Approved fixture description", "/products/test-a", false, catalog[0].images);
  assert.deepEqual(metadata.alternates, { canonical: `${site.url}/products/test-a` });
  assert.deepEqual(metadata.robots, { index: true, follow: true });
  assert.equal(metadata.openGraph?.title, `Fixture product | ${site.name}`);
  assert.ok(JSON.stringify(metadata.openGraph).includes(`${site.url}/images/catalog/`));
  assert.ok(metadata.twitter && "card" in metadata.twitter);
  assert.equal(metadata.twitter.card, "summary_large_image");
  assert.deepEqual(pageMetadata("Sample", "Preview", "/products/sample-item", true).robots, { index: false, follow: false });
  for (const environment of ["preview", "development", "staging", ""]) assert.equal(isPreviewDeployment(environment, "1"), true);
  assert.equal(isPreviewDeployment("production", "1"), false);
  assert.equal(isPreviewDeployment(undefined, "1"), true);
});

test("structured data contains verified facts without invented offers, ratings or location claims", () => {
  const organization = organizationStructuredData()!;
  const text = JSON.stringify(organization);
  for (const value of [site.name, site.contact.address!, site.url!, `+${site.whatsappNumber}`, "WebSite", "Organization"]) assert.ok(text.includes(value));
  for (const key of ["geo", "openingHours", "sameAs", "aggregateRating", "review"]) assert.ok(!text.includes(`"${key}"`));
  const product = productStructuredData(fixture({ pricePkr: null, stockStatus: "unconfirmed" }))!;
  assert.equal(product.name, "Alpha test component");
  for (const key of ["offers", "price", "availability", "itemCondition", "review", "aggregateRating"]) assert.ok(!Object.hasOwn(product, key));
  assert.equal(productStructuredData(fixture({ isSample: true })), null);
  const breadcrumbs = breadcrumbStructuredData([{ label: "Shop", href: "/shop" }, { label: "Fixture item" }]);
  assert.deepEqual(breadcrumbs.itemListElement.map(item => item.position), [1, 2, 3]);
  assert.equal(breadcrumbs.itemListElement[1].item, `${site.url}/shop`);
  const payload = { name: "</script><img src=x onerror=alert(1)> & \u2028" };
  const serialized = serializeStructuredData(payload);
  assert.doesNotMatch(serialized, /[<>&\u2028]/);
  assert.deepEqual(JSON.parse(serialized), payload);
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
