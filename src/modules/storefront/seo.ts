import type { Metadata, MetadataRoute } from "next";
import { site } from "@/lib/site";
import { publicOrigin, publicPageUrl } from "@/lib/urls";
import { categoryDetails } from "@/modules/catalog/categories";
import type { Product } from "@/modules/catalog/types";
import { policies } from "./policies";
import { isPreviewDeployment } from "./deployment";

export function pageMetadata(title: string, description: string, path: string, noIndex = false, images: Product["images"] | readonly [] = []): Metadata {
  const url = publicPageUrl(path, site.url);
  const blocked = noIndex || site.preview || !url || isPreviewDeployment();
  const socialImages = images.map(image => ({ url: publicPageUrl(image.src, site.url)!, alt: image.alt }));
  return {
    title, description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: { title: `${title} | ${site.name}`, description, type: "website", siteName: site.name, locale: "en_PK", ...(url ? { url } : {}), ...(socialImages.length ? { images: socialImages } : {}) },
    twitter: { card: socialImages.length ? "summary_large_image" : "summary", title: `${title} | ${site.name}`, description, ...(socialImages.length ? { images: [socialImages[0]] } : {}) },
    robots: { index: !blocked, follow: !blocked },
  };
}

export function storefrontSitemap(origin: string | null, preview: boolean, catalog: readonly Product[]): MetadataRoute.Sitemap {
  const base = publicOrigin(origin);
  if (!base || preview) return [];
  const paths = ["/", "/shop", "/categories", "/about", "/contact",
    ...policies.map(policy => `/policies/${policy.slug}`),
    ...categoryDetails.filter((category) => catalog.some((product) => !product.isSample && product.published !== false && product.category === category.name)).map((category) => `/categories/${category.slug}`),
    ...catalog.filter((product) => !product.isSample && product.published !== false).map((product) => `/products/${product.slug}`)];
  return paths.map((path) => ({ url: new URL(path, base).href, changeFrequency: path === "/shop" ? "weekly" : "monthly", priority: path === "/" ? 1 : path.startsWith("/products/") ? 0.8 : 0.6 }));
}

export function storefrontRobots(origin: string | null, preview: boolean): MetadataRoute.Robots {
  const base = publicOrigin(origin);
  if (preview || !base) return { rules: { userAgent: "*", disallow: "/" } };
  // Sample pages stay crawlable so search engines can read their explicit noindex.
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/api", "/docs", "/backend-preserved", "/prisma"] }, sitemap: `${base}/sitemap.xml` };
}
