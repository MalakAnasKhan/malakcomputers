import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageIntro } from "@/components/storefront/page-intro";
import { CatalogNotice } from "@/components/storefront/catalog-notice";
import { getStorefrontCatalog } from "@/modules/catalog/supabase-products";
import { ShopCatalog } from "@/modules/catalog/shop-catalog";
import { CatalogFallback } from "@/modules/catalog/catalog-fallback";
import { pageMetadata } from "@/modules/storefront/seo";

export const revalidate = 60; // ISR fallback

export const metadata = pageMetadata(
  "Shop PC hardware",
  "Search PC components by category, brand and availability. Compare hardware and prepare a WhatsApp order enquiry with Malak Computers.",
  "/shop"
);

export default async function ShopPage() {
  const catalog = await getStorefrontCatalog();

  return (
    <PageContainer>
      <PageIntro
        eyebrow="The hardware collection"
        title="Find your next component."
        description="Browse the details. Refine your shortlist. Take the conversation to WhatsApp when you’re ready."
        breadcrumbs={[{ label: "Shop" }]}
      />
      <CatalogNotice />
      <section id="search" aria-label="Search and browse products" tabIndex={-1}>
        <Suspense fallback={<CatalogFallback catalog={catalog} />}>
          <ShopCatalog catalog={catalog} />
        </Suspense>
      </section>
    </PageContainer>
  );
}
