import { categories, type Category, type Product, type StockStatus } from "./types";

export type CatalogFilters = {
  query: string;
  category: Category | "all";
  brand: string;
  availability: StockStatus | "all";
  sort: "featured" | "price-asc" | "price-desc" | "name";
};
export const defaultFilters: CatalogFilters = { query: "", category: "all", brand: "all", availability: "all", sort: "featured" };
const availability = ["all", "in-stock", "out-of-stock", "on-request", "unconfirmed"];
const sorts = ["featured", "price-asc", "price-desc", "name"];

export function readFilters(params: URLSearchParams, catalog: readonly Product[], fixedCategory?: Category): CatalogFilters {
  const category = params.get("category");
  const brand = params.get("brand");
  return {
    query: (params.get("q") ?? "").slice(0, 120),
    category: fixedCategory ?? (categories.includes(category as Category) ? category as Category : "all"),
    brand: brand && catalog.some((product) => product.brand === brand) ? brand : "all",
    availability: availability.includes(params.get("availability") ?? "") ? params.get("availability") as CatalogFilters["availability"] : "all",
    sort: sorts.includes(params.get("sort") ?? "") ? params.get("sort") as CatalogFilters["sort"] : "featured",
  };
}

export function filterQuery(filters: CatalogFilters, fixedCategory?: Category): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query.slice(0, 120));
  if (filters.category !== "all" && !fixedCategory) params.set("category", filters.category);
  if (filters.brand !== "all") params.set("brand", filters.brand);
  if (filters.availability !== "all") params.set("availability", filters.availability);
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  return params.toString();
}

export function filterProducts(catalog: readonly Product[], filters: CatalogFilters): Product[] {
  const query = filters.query.trim().toLocaleLowerCase("en");
  return catalog.filter((product) => {
    const searchable = [product.name, product.id, product.brand, product.category, product.description,
      ...product.specifications.flatMap((spec) => [spec.name, spec.value])].join(" ").toLocaleLowerCase("en");
    return (!query || searchable.includes(query)) &&
      (filters.category === "all" || product.category === filters.category) &&
      (filters.brand === "all" || product.brand === filters.brand) &&
      (filters.availability === "all" || product.stockStatus === filters.availability);
  }).sort((a, b) => {
    const byName = a.name.localeCompare(b.name, "en") || a.id.localeCompare(b.id, "en");
    if (filters.sort === "name") return byName;
    if (filters.sort === "featured") return Number(b.featured) - Number(a.featured) || byName;
    // An unknown price is always last, including descending order.
    if (a.pricePkr === null || b.pricePkr === null) return Number(a.pricePkr === null) - Number(b.pricePkr === null) || byName;
    return (filters.sort === "price-asc" ? a.pricePkr - b.pricePkr : b.pricePkr - a.pricePkr) || byName;
  });
}

export function relatedProducts(product: Product, catalog: readonly Product[], limit = 3): Product[] {
  return catalog.filter((item) => item.id !== product.id).sort((a, b) =>
    Number(b.category === product.category) - Number(a.category === product.category) ||
    Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, "en")).slice(0, limit);
}
