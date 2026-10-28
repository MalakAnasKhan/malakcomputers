import { site } from "@/lib/site";
import { publicPageUrl } from "@/lib/urls";
import type { Product } from "@/modules/catalog/types";

export function organizationStructuredData() {
  if (!site.url) return null;
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": `${site.url}/#organization`, name: site.name, url: site.url,
      ...(site.whatsappNumber ? { telephone: `+${site.whatsappNumber}` } : {}),
      ...(site.contact.address ? { address: site.contact.address } : {}) },
    { "@type": "WebSite", "@id": `${site.url}/#website`, name: site.name, url: site.url, publisher: { "@id": `${site.url}/#organization` } },
  ] };
}

export function breadcrumbStructuredData(items: readonly { label: string; href?: string }[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { label: "Home", href: "/" }, ...items,
  ].map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label,
    ...(item.href ? { item: publicPageUrl(item.href, site.url) } : {}) })) };
}

/** No offers, stock, condition, ratings or reviews are inferred from photographs. */
export function productStructuredData(product: Product) {
  if (product.isSample || product.published === false) return null;
  return { "@context": "https://schema.org", "@type": "Product", name: product.name, sku: product.id,
    url: publicPageUrl(`/products/${product.slug}`, site.url),
    image: product.images.map(image => publicPageUrl(image.src, site.url)),
    ...(product.description ? { description: product.description } : {}),
    ...(product.brand !== "Not specified" ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.category ? { category: product.category } : {}),
  };
}

/** JSON escaping prevents catalog text from closing a script element. */
export function serializeStructuredData(data: unknown): string {
  return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`);
}
