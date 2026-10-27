import type { Product } from "./types";

/** Public image provenance only. Business facts must stay in the manual catalog. */
export type DiscoveredProduct = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly images: readonly string[];
};

export function productSlug(name: string): string {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function validateDiscoveries(value: unknown): asserts value is DiscoveredProduct[] {
  if (!Array.isArray(value)) throw new Error("Discovered catalog must be an array.");
  const ids = new Set<string>(), slugs = new Set<string>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Object.keys(entry).sort().join() !== "id,images,name,slug" ||
      typeof entry.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug) ||
      typeof entry.name !== "string" || !entry.name.trim() || productSlug(entry.name) !== entry.slug ||
      entry.id !== `image-${entry.slug}` || ids.has(entry.id) || slugs.has(entry.slug) ||
      !Array.isArray(entry.images) || entry.images.length !== 4 ||
      entry.images.some((path: unknown, index: number) => path !== `/products/${entry.slug}/${index + 1}.webp`)) {
      throw new Error("Invalid or conflicting discovered catalog entry.");
    }
    ids.add(entry.id); slugs.add(entry.slug);
  }
}

/** Manual metadata and canonical IDs/URLs always win; discovery never grants orderability. */
export function mergeDiscoveredProducts(manual: readonly Product[], discovered: unknown): readonly Product[] {
  validateDiscoveries(discovered);
  const result = [...manual];
  for (const entry of discovered) {
    if (manual.some(product => product.id === entry.id && product.slug !== entry.slug && productSlug(product.name) !== entry.slug)) throw new Error("Discovered ID conflicts with an unrelated manual product.");
    const matches = manual.filter(product => product.id === entry.id || product.slug === entry.slug || productSlug(product.name) === entry.slug);
    if (matches.length > 1) throw new Error("Ambiguous manual/discovered catalog match.");
    const images = entry.images.map((src, index) => ({ src, alt: `${entry.name}, product image ${index + 1}` }));
    const gallery = [images[0], ...images.slice(1)] as Product["images"];
    if (matches.length) {
      const index = result.indexOf(matches[0]);
      result[index] = { ...matches[0], images: gallery };
    } else {
      result.push({ id: entry.id, slug: entry.slug, name: entry.name, images: gallery,
        brand: "Not specified", category: null, pricePkr: null, description: "", specifications: [],
        stockStatus: "unconfirmed", featured: false, isSample: false });
    }
  }
  return result;
}
