import type { Product } from "./types";

/** Generated image paths may replace galleries, never business or approval data. */
export function applyImageGalleries(catalog: readonly Product[], galleries: Readonly<Record<string, readonly string[]>>): readonly Product[] {
  return catalog.map((product) => {
    if (!Object.hasOwn(galleries, product.slug)) return product;
    const paths = galleries[product.slug];
    const group = paths[0]?.match(/^\/products\/([a-z0-9]+(?:-[a-z0-9]+)*)\/1\.webp$/)?.[1];
    if (!group || paths.length !== 4 || paths.some((path, i) => path !== `/products/${group}/${i + 1}.webp`)) {
      throw new Error("Imported galleries must contain four ordered, local product images.");
    }
    const images = paths.map((src, i) => ({ src, alt: `${product.name}, product image ${i + 1}` }));
    return { ...product, images: [images[0], ...images.slice(1)] };
  });
}
