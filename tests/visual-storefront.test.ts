import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { allowEnhancedMotion, sameDocumentAnchor } from "../src/modules/storefront/motion-policy";
import { editorial } from "../src/modules/storefront/editorial";
import { products } from "../src/modules/catalog/products";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductGallery } from "../src/modules/catalog/product-gallery";
import { OrderingSteps } from "../src/components/storefront/ordering-steps";

test("enhanced motion is opt-in for capable desktop devices, never reduced-motion/mobile/save-data users", () => {
  const desktop = { reducedMotion: false, width: 1440, finePointer: true, saveData: false, memory: 8, cores: 8 };
  assert.equal(allowEnhancedMotion(desktop), true);
  for (const patch of [{ reducedMotion: true }, { width: 1023 }, { finePointer: false }, { saveData: true }, { memory: 2 }, { cores: 2 }]) assert.equal(allowEnhancedMotion({ ...desktop, ...patch }), false);
  assert.equal(allowEnhancedMotion({ ...desktop, memory: undefined, cores: undefined }), true);
});

test("smooth anchors accept same-document fragments and preserve normal navigation boundaries", () => {
  const page = "https://store.example/";
  assert.equal(sameDocumentAnchor("/#how-to-order", page), "how-to-order");
  assert.equal(sameDocumentAnchor("#the%20details", page), "the details");
  const shop = "https://store.example/shop?category=Memory";
  assert.equal(sameDocumentAnchor("#search", shop), "search");
  assert.equal(sameDocumentAnchor("/shop?category=Memory#search", shop), "search");
  assert.equal(sameDocumentAnchor("/shop#search", shop), null);
  for (const destination of ["/shop#search", "https://other.example/#catalog", "?sort=price#catalog", "#", "#%00", "#%E0%A4%A", "javascript:alert(1)", "https://user:password@store.example/#catalog"]) assert.equal(sameDocumentAnchor(destination, page), null);
});

test("editorial concepts are optimized, clearly identified and never substituted for catalog images", () => {
  for (const asset of [editorial.hero, editorial.story]) {
    assert.match(asset.alt, /AI-generated editorial/);
    assert.match(asset.src, /^\/images\/editorial\/[a-z-]+\.webp$/);
    const file = "public" + asset.src;
    const bytes = readFileSync(file);
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
    assert.ok(statSync(file).size < 250 * 1024);
  }
  assert.match(editorial.caption, /not a product listing/);
  for (const product of products) assert.ok(product.images.every(image => !image.src.includes("/editorial/")));
});

test("restyled gallery renders four numerical next/image thumbnails with accessible sample status", () => {
  const images = [1, 2, 3, 4].map(number => ({ src: `/products/fixture-gallery/${number}.webp`, alt: `Offline gallery fixture view ${number}` }));
  const html = renderToStaticMarkup(createElement(ProductGallery, { images: [images[0], ...images.slice(1)], name: "Offline gallery fixture", isSample: true }));
  assert.equal((html.match(/class="gallery-thumb"/g) ?? []).length, 4);
  let previous = -1;
  for (const number of [1, 2, 3, 4]) {
    const index = html.indexOf(`aria-label="View image ${number}:`);
    assert.ok(index > previous);
    previous = index;
  }
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /not offered for sale/);
  assert.match(html, /_next\/image/);
  assert.match(html, /class="object-cover"/);
  assert.match(html, /aria-pressed="false" aria-controls="[^"]+"[^>]*>Show full image/);
});

test("ordering steps render visible SSR markup without animation-owned inline styles", () => {
  const html = renderToStaticMarkup(createElement(OrderingSteps));
  assert.equal((html.match(/data-reveal="true"/g) ?? []).length, 5);
  for (const title of ["Explore Products", "Contact on WhatsApp", "Confirm Your Order", "Receive Your Product"]) assert.ok(html.includes(title));
  assert.doesNotMatch(html, /style=|suppressHydrationWarning/);
});
