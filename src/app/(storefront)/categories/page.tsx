import { PageContainer } from "@/components/layout/page-container";
import { PageIntro } from "@/components/storefront/page-intro";
import { CategoryGrid } from "@/components/storefront/category-grid";
import { CatalogNotice } from "@/components/storefront/catalog-notice";
import { pageMetadata } from "@/modules/storefront/seo";

export const metadata = pageMetadata("Shop by category", "Explore graphics cards, processors, memory and storage with Malak Computers. Find a starting point for your next PC build.", "/categories");
export default function CategoriesPage() {
  return <PageContainer className="pb-16 sm:pb-24"><PageIntro eyebrow="Build from the essentials" title="Every component. A possibility." description="Start with the part you have in mind. Explore the specifications, compare your options, and find your next component." breadcrumbs={[{ label: "Categories" }]} /><div className="mb-8"><CatalogNotice /></div><CategoryGrid /></PageContainer>;
}
