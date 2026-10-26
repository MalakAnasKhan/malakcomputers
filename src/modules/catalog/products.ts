import { categories, type Product } from "./types";

import { catalogData } from "./data";
import galleries from "./imported-images.json" with { type: "json" };
import { applyImageGalleries } from "./image-galleries";

export const products: readonly Product[] = applyImageGalleries(catalogData, galleries);

export function validateCatalog(catalog: readonly Product[]): void {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const product of catalog) {
    if (!product.id.trim() || ids.has(product.id) || slugs.has(product.slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug)) {
      throw new Error("Catalog IDs and slugs must be present and unique; slugs must be URL-safe.");
    }
    if (!product.name.trim() || !product.brand.trim() || !product.description.trim() || !categories.includes(product.category)) {
      throw new Error("Catalog product details are incomplete.");
    }
    if (product.pricePkr !== null && (!Number.isSafeInteger(product.pricePkr) || product.pricePkr < 0)) {
      throw new Error("Catalog prices must be non-negative whole PKR amounts or null.");
    }
    if (!["in-stock", "out-of-stock", "on-request", "unconfirmed"].includes(product.stockStatus)) {
      throw new Error("Catalog stock status is invalid.");
    }
    if (!product.images.length || product.images.some((image) => !(/^(?:\/images\/catalog\/[a-z0-9/-]+\.(?:svg|webp|png|jpg|jpeg)|\/products\/[a-z0-9]+(?:-[a-z0-9]+)*\/[1-4]\.webp)$/.test(image.src)) || !image.alt.trim())) {
      throw new Error("Catalog images must have local catalog paths and descriptive alt text.");
    }
    if (product.isSample && (product.pricePkr !== null || product.stockStatus !== "unconfirmed")) {
      throw new Error("Sample products cannot claim real prices or availability.");
    }
    ids.add(product.id);
    slugs.add(product.slug);
  }
}

validateCatalog(products);

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
