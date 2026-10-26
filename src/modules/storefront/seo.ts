import type { Metadata, MetadataRoute } from "next";
import { site } from "@/lib/site";
import { publicOrigin, publicPageUrl } from "@/lib/urls";
import { categoryDetails } from "@/modules/catalog/categories";
import type { Product } from "@/modules/catalog/types";

export function pageMetadata(title: string, description: string, path: string, noIndex = false): Metadata {
  const url = publicPageUrl(path, site.url);
  return {
    title, description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: { title: `${title} | ${site.name}`, description, type: "website", siteName: site.name, locale: "en_PK", ...(url ? { url } : {}) },
    twitter: { card: "summary", title, description },
    ...(noIndex || site.preview || !url ? { robots: { index: false, follow: false } } : {}),
  };
}

export function storefrontSitemap(origin: string | null, preview: boolean, catalog: readonly Product[]): MetadataRoute.Sitemap {
  const base = publicOrigin(origin);
  if (!base || preview) return [];
  const paths = ["/", "/shop", "/categories", "/about", "/contact",
    ...categoryDetails.filter((category) => catalog.some((product) => !product.isSample && product.category === category.name)).map((category) => `/categories/${category.slug}`),
    ...catalog.filter((product) => !product.isSample).map((product) => `/products/${product.slug}`)];
  return paths.map((path) => ({ url: new URL(path, base).href, changeFrequency: path === "/shop" ? "weekly" : "monthly", priority: path === "/" ? 1 : path.startsWith("/products/") ? 0.8 : 0.6 }));
}

export function storefrontRobots(origin: string | null, preview: boolean): MetadataRoute.Robots {
  const base = publicOrigin(origin);
  if (preview || !base) return { rules: { userAgent: "*", disallow: "/" } };
  // Draft policies remain crawlable so their own noindex metadata can be read.
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/api"] }, sitemap: `${base}/sitemap.xml` };
}
