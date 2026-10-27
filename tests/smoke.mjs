import http from "node:http";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

let checks = 0;

// Fixed loopback target only. No business credentials, requests or external links.
function request(path) {
  checks++;
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: "127.0.0.1", port: 3108, path }, (response) => {
      let body = "";
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ status: response.statusCode, headers: response.headers, body }));
    });
    req.setTimeout(10000, () => req.destroy(new Error("Local smoke request timed out.")));
    req.on("error", reject);
  });
}

const manifest = JSON.parse(readFileSync(".next/prerender-manifest.json", "utf8"));
const routes = Object.keys(manifest.routes).filter((path) => path === "/" || /^\/(?:shop|about|contact|categories|products|policies)(?:\/|$)/.test(path));
const pages = new Map();
for (const path of routes) {
  const page = await request(path);
  assert.equal(page.status, 200, path);
  assert.equal((page.body.match(/<h1\b/g) ?? []).length, 1, `One page heading: ${path}`);
  assert.equal((page.body.match(/id="main-content"/g) ?? []).length, 1, `One main landmark: ${path}`);
  assert.match(page.body, /Skip to content/);
  assert.equal(page.headers["x-content-type-options"], "nosniff");
  assert.equal(page.headers["x-frame-options"], "DENY");
  assert.match(page.body, /<meta name="robots" content="noindex, nofollow"/);
  assert.match(page.body, /aria-controls="mobile-navigation"/);
  assert.match(page.body, /id="mobile-navigation" hidden=""/);
  assert.match(page.body, /Chat on WhatsApp/);
  for (const link of page.body.matchAll(/<a\b[^>]*href="(https:\/\/wa\.me\/[^\"]+)"[^>]*>/g)) {
    const url = new URL(link[1].replaceAll("&amp;", "&"));
    assert.equal(url.pathname, "/923109806478");
    assert.ok(url.searchParams.get("text"));
    assert.match(link[0], /target="_blank"/);
    assert.match(link[0], /rel="noopener noreferrer"/);
    if (path.startsWith("/products/") && page.body.includes("Sample listing")) assert.doesNotMatch(url.searchParams.get("text"), /Product ID\/SKU:|I would like to order:/);
  }
  assert.doesNotMatch(page.body, /supabase\.co|postgres(?:ql)?:\/\/|href="\/auth|href="\/admin/);
  if (path.startsWith("/products/")) {
    assert.match(page.body, /Specifications/);
    assert.match(page.body, /SKU:/);
    assert.match(page.body, /image gallery/);
    if (page.body.includes("Sample listing")) { assert.match(page.body, /ordering unavailable/); assert.match(page.body, /noindex/); }
    if (path === "/products/z890-aorus-pro-ice") {
      for (const text of ["Z890 Aorus Pro Ice", "Price on request", "Availability to be confirmed", "Enquire on WhatsApp", "Specifications awaiting approved details."]) assert.ok(page.body.includes(text));
      assert.doesNotMatch(page.body, /Order on WhatsApp/);
      assert.equal((page.body.match(/aria-label="View image [1-4]:/g) ?? []).length, 4);
    }
  }
  if (path.startsWith("/policies/")) { assert.match(page.body, /awaiting business approval/); assert.match(page.body, /noindex/); }
  pages.set(path, page);
}
for (const path of ["/", "/shop", "/categories", "/about", "/contact"]) assert.ok(pages.has(path));
assert.match(pages.get("/").body, /Why Malak Computers/);
assert.match(pages.get("/").body, /id="how-to-order"/);
assert.match(pages.get("/shop").body, /data-product-card=/);
assert.match(pages.get("/shop").body, /id="search"/);
assert.match(pages.get("/contact").body, /\+923109806478/);
assert.doesNotMatch(pages.get("/contact").body, /Awaiting approved business details|business number has not been published/);
// Follow every public navigation/product/policy destination without visiting external links.
for (const [source, page] of pages) for (const match of page.body.matchAll(/href="((?:\/(?!_next)|#)[^"]*)"/g)) {
  const link = new URL(match[1].replaceAll("&amp;", "&"), `http://127.0.0.1:3108${source}`);
  const destination = link.pathname;
  if (!/\.[a-z]+$/.test(destination)) assert.ok(pages.has(destination), `Broken internal destination: ${destination}`);
  if (link.hash && pages.has(destination)) assert.ok(pages.get(destination).body.includes(`id="${decodeURIComponent(link.hash.slice(1))}"`), `Broken section link on ${source}`);
}
assert.equal((await request("/shop?q=no-match&brand=invalid&sort=invalid")).status, 200);
for (const path of ["/admin", "/admin/inventory", "/api/admin/finance", "/auth/login", "/auth/callback", "/products/missing-product", "/categories/missing-category", "/policies/missing-policy", "/docs/authorization-schema.md", "/docs/database-role-strategy.md", "/backend-preserved/README.md", "/prisma/schema.prisma"]) {
  const page = await request(path);
  assert.equal(page.status, 404);
  assert.match(page.body, /Page not found/);
}
for (const name of ["gpu", "cpu", "memory", "storage"]) {
  const image = await request(`/images/catalog/sample-${name}.svg`);
  assert.equal(image.status, 200);
  assert.match(image.headers["content-type"], /image\/svg\+xml/);
}
assert.equal((await request("/images/showcase/build-study.svg")).status, 200);
for (const number of [1, 2, 3, 4]) {
  const image = await request(`/products/z890-aorus-pro-ice/${number}.webp`);
  assert.equal(image.status, 200);
  assert.match(image.headers["content-type"], /image\/webp/);
}
for (const weight of [400, 500, 600, 700]) {
  const font = await request(`/fonts/poppins-latin-${weight}.woff2`);
  assert.equal(font.status, 200);
  assert.match(font.headers["content-type"], /font\/woff2/);
}
const robots = await request("/robots.txt");
assert.equal(robots.status, 200);
assert.match(robots.body, /Disallow: \//);
const sitemap = await request("/sitemap.xml");
assert.equal(sitemap.status, 200);
assert.match(sitemap.body, /urlset/);
assert.doesNotMatch(sitemap.body, /sample-|supabase/);
console.log(`${checks} public loopback HTTP checks passed across ${routes.length} pages, navigation destinations, assets, SEO and missing/private routes. No database or Auth requests.`);
