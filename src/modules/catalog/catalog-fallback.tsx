import type { Category, Product } from "./types";
import { ProductCard } from "./product-card";
import { defaultFilters, filterProducts } from "./filters";

// Real server-rendered listings keep the catalog browsable before hydration and
// with JavaScript disabled; the interactive island takes over when ready.
export function CatalogFallback({ catalog, fixedCategory }: { catalog: readonly Product[]; fixedCategory?: Category }) {
  const listings = filterProducts(catalog, { ...defaultFilters, category: fixedCategory ?? "all" });
  return <div className="py-10"><h2 className="sr-only">Product listings</h2><p className="sr-only" role="status">Preparing catalog filters.</p><div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{listings.map((product) => <ProductCard key={product.id} product={product} />)}</div><noscript><p className="mt-8 text-xs leading-6">Enable JavaScript to use search and filters. All listings above remain browsable.</p></noscript></div>;
}
