import { site } from "@/lib/site";
import { products } from "@/modules/catalog/products";
import { storefrontSitemap } from "@/modules/storefront/seo";
export default function sitemap() { return storefrontSitemap(site.url, site.preview, products); }
