import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { site } from "@/lib/site";
import { getProduct, products } from "@/modules/catalog/products";
import { formatPrice, stockLabels } from "@/modules/catalog/presentation";
import { ProductGallery } from "@/modules/catalog/product-gallery";
import { OrderButton } from "@/modules/catalog/order-button";
import { ProductCard } from "@/modules/catalog/product-card";
import { categoryHref } from "@/modules/catalog/categories";
import { relatedProducts } from "@/modules/catalog/filters";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { SectionHeading } from "@/components/storefront/section-heading";
import { pageMetadata } from "@/modules/storefront/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return product ? pageMetadata(product.name, product.description || `View photographs of ${product.name}. Contact Malak Computers to confirm price, availability and product details.`, `/products/${product.slug}`, product.isSample) : { title: "Product not found" };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const related = relatedProducts(product, products);
  return (
    <PageContainer className="py-8 sm:py-14">
      <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, ...(product.category ? [{ label: product.category, href: categoryHref(product.category) }] : []), { label: product.name }]} />
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} isSample={product.isSample} />
        <div className="product-summary">
          <p className="eyebrow">{product.category ?? "Category unspecified"}</p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">{product.name}</h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-neutral-500"><p>Brand: {product.brand}</p><p>SKU: {product.id}</p></div>
          {product.isSample && <p className="catalog-notice mt-6 block"><strong>Sample listing.</strong> A layout preview, not a product offered for sale. Specifications, price and availability await approval.</p>}
          <div className="product-price-panel"><p className="text-xl font-semibold tracking-tight">{formatPrice(product.pricePkr)}</p><p className="mt-3 text-[11px] text-neutral-500">{stockLabels[product.stockStatus]}</p></div>
          <p className="text-xs leading-7 text-neutral-600">{product.description || "Product description awaiting approved details. Photographs do not confirm current stock or specifications."}</p>
          <OrderButton product={product} className="mt-7 w-full" />
          <p className="mt-3 text-[10px] leading-6 text-neutral-500">Stock, delivery charges and payment details must be confirmed directly on WhatsApp. Opening a message does not confirm an order or payment.</p>
          {!site.whatsappNumber && <p className="mt-2 text-[10px] text-neutral-500">WhatsApp contact details are awaiting approval.</p>}
          <details open className="product-specifications"><summary className="py-5 text-sm font-semibold">Specifications</summary>{product.specifications.length ? <dl className="divide-y divide-neutral-200 text-xs">{product.specifications.map((spec) => <div key={spec.name} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-5 py-4"><dt className="text-neutral-500">{spec.name}</dt><dd>{spec.value}</dd></div>)}</dl> : <p className="pb-5 text-xs text-neutral-500">Specifications awaiting approved details.</p>}</details>
          <div className="mt-5 flex flex-wrap gap-x-6 text-[10px] text-neutral-500"><Link href="/policies/shipping" className="py-2 underline underline-offset-4">Shipping information</Link><Link href="/policies/returns" className="py-2 underline underline-offset-4">Returns & warranty</Link></div>
        </div>
      </div>
      {related.length > 0 && <section className="section-space mt-14 border-t border-neutral-200"><SectionHeading eyebrow="Keep exploring" title="More for your next build." href="/shop" linkLabel="View all products" /><div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    </PageContainer>
  );
}
