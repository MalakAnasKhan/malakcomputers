import { site } from "@/lib/site";
import { storefrontRobots } from "@/modules/storefront/seo";
export default function robots() { return storefrontRobots(site.url, site.preview); }
