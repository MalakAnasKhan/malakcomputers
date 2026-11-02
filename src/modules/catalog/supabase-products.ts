import { createClient } from "@/lib/supabase/server";
import { products as localProducts } from "./products";
import type { Product, Category, Condition, StockStatus } from "./types";

export type DbProduct = {
  id: string;
  title: string;
  slug: string;
  category: string;
  price_pkr: number | null;
  condition: "Box Pack" | "Used" | "Refurbished";
  stock_status: "in-stock" | "out-of-stock" | "on-request";
  description: string;
  specs: { name: string; value: string }[] | Record<string, string>;
  images: string[] | { src: string; alt: string }[];
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export function mapDbProductToProduct(row: DbProduct): Product {
  // Normalize specifications
  let specifications: { name: string; value: string }[] = [];
  if (Array.isArray(row.specs)) {
    specifications = row.specs.filter(
      (s) => s && typeof s.name === "string" && typeof s.value === "string"
    );
  } else if (row.specs && typeof row.specs === "object") {
    specifications = Object.entries(row.specs).map(([name, value]) => ({
      name,
      value: String(value),
    }));
  }

  // Normalize images
  let images: [{ src: string; alt: string }, ...{ src: string; alt: string }[]];
  if (Array.isArray(row.images) && row.images.length > 0) {
    const formatted = row.images.map((img, idx) => {
      if (typeof img === "string") {
        return { src: img, alt: `${row.title} - View ${idx + 1}` };
      }
      return {
        src: img.src || "/images/catalog/sample-gpu.svg",
        alt: img.alt || row.title,
      };
    });
    images = [formatted[0], ...formatted.slice(1)];
  } else {
    images = [{ src: "/images/catalog/sample-gpu.svg", alt: row.title }];
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.title,
    brand: "Malak Computers",
    category: (row.category as Category) || null,
    pricePkr: row.price_pkr,
    condition: row.condition as Condition,
    images,
    description: row.description || "",
    specifications,
    stockStatus: row.stock_status as StockStatus,
    featured: Boolean(row.featured),
    isSample: false,
    published: row.published,
  };
}

/**
 * Fetch all published products from Supabase.
 * Returns empty array if Supabase table is not yet set up or an error occurs.
 */
export async function fetchPublishedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return (data as DbProduct[]).map(mapDbProductToProduct);
  } catch (err) {
    console.error("Failed to fetch published products from Supabase:", err);
    return [];
  }
}

/**
 * Fetch a single product by slug from Supabase.
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDbProductToProduct(data as DbProduct);
  } catch (err) {
    console.error(`Failed to fetch product with slug '${slug}' from Supabase:`, err);
    return null;
  }
}

/**
 * Merged storefront catalog:
 * Real Supabase products appear first, followed by existing static non-sample products,
 * then samples if needed, deduplicated by slug.
 */
export async function getStorefrontCatalog(): Promise<Product[]> {
  const dynamicProducts = await fetchPublishedProducts();
  const dynamicSlugs = new Set(dynamicProducts.map((p) => p.slug));

  const remainingStatic = localProducts.filter((p) => !dynamicSlugs.has(p.slug));

  return [...dynamicProducts, ...remainingStatic];
}

/**
 * Get a single product for the storefront:
 * Checks Supabase first, falls back to local products.
 */
export async function getStorefrontProduct(slug: string): Promise<Product | undefined> {
  const dynamic = await fetchProductBySlug(slug);
  if (dynamic) {
    return dynamic;
  }
  return localProducts.find((p) => p.slug === slug);
}

