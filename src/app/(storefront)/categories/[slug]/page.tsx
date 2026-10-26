import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageIntro } from "@/components/storefront/page-intro";
import { CatalogNotice } from "@/components/storefront/catalog-notice";
import { categoryDetails, getCategory } from "@/modules/catalog/categories";
import { products } from "@/modules/catalog/products";
import { ShopCatalog } from "@/modules/catalog/shop-catalog";
import { CatalogFallback } from "@/modules/catalog/catalog-fallback";
import { pageMetadata } from "@/modules/storefront/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return categoryDetails.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props) {
  const category = getCategory((await params).slug);
  return category ? pageMetadata(category.name, category.description, `/categories/${category.slug}`, !products.some((product) => !product.isSample && product.category === category.name)) : { title: "Category not found" };
}
export default async function CategoryPage({ params }: Props) {
  const category = getCategory((await params).slug);
  if (!category) notFound();
  return <PageContainer><PageIntro eyebrow="Shop by category" title={category.name} description={category.description} breadcrumbs={[{ label: "Categories", href: "/categories" }, { label: category.name }]} /><CatalogNotice /><Suspense fallback={<CatalogFallback catalog={products} fixedCategory={category.name} />}><ShopCatalog catalog={products} fixedCategory={category.name} /></Suspense></PageContainer>;
}
