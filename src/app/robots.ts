import { site } from "@/lib/site";
import { storefrontRobots } from "@/modules/storefront/seo";
import { isPreviewDeployment } from "@/modules/storefront/deployment";
export default function robots() { return storefrontRobots(site.url, site.preview || isPreviewDeployment()); }
