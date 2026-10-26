import { PageContainer } from "@/components/layout/page-container";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/modules/catalog/products";
import { ProductCard } from "@/modules/catalog/product-card";
import { CategoryGrid } from "@/components/storefront/category-grid";
import { SectionHeading } from "@/components/storefront/section-heading";
import { CatalogNotice } from "@/components/storefront/catalog-notice";
import { OrderingSteps } from "@/components/storefront/ordering-steps";
import { Icon } from "@/components/ui/icon";
import { pageMetadata } from "@/modules/storefront/seo";

export const metadata = pageMetadata("PC hardware for what’s next", "Explore PC hardware with Malak Computers, a Pakistan-based business. Browse components and confirm your order personally on WhatsApp.", "/");

export default function HomePage() {
  return (
    <>
      <section className="overflow-hidden border-b border-neutral-200 bg-[#f2f2ef]">
        <PageContainer className="grid items-center gap-5 pb-9 pt-12 sm:pt-16 lg:min-h-[640px] lg:grid-cols-[1.05fr_1fr] lg:gap-0 lg:py-12">
          <div className="reveal relative z-10 pb-5 lg:py-10"><p className="eyebrow">Consider the details. Build your way.</p><h1 className="mt-6 text-[clamp(2.7rem,6.8vw,6.5rem)] font-semibold leading-[1.02] tracking-[-0.065em]">PC hardware.<br />For what’s<br /><span className="text-neutral-500">next.</span></h1><p className="mt-7 max-w-sm text-xs leading-7 text-neutral-600 sm:text-sm">For your next game, your next project, your next idea. Find the components that belong in your build.</p><div className="mt-8 flex flex-wrap items-center gap-6"><Link href="/shop" className="button">Explore the shop<Icon name="arrow-up" /></Link><Link href="#how-to-order" className="text-link">How to order<Icon name="arrow" /></Link></div></div>
          <figure className="reveal relative min-w-0 lg:-mr-12"><div className="relative aspect-[6/5]"><Image src="/images/showcase/build-study.svg" alt="Monochrome PC case and component study; an illustration, not an actual product listing" fill priority sizes="(max-width: 1023px) 100vw, 55vw" className="object-contain" /></div><figcaption className="flex items-center justify-between border-t border-neutral-300 py-4 text-[9px] uppercase tracking-[0.14em] text-neutral-600"><span>Hardware, considered.</span><span>Illustration / 001</span></figcaption></figure>
        </PageContainer>
      </section>
      <section id="catalog" aria-labelledby="catalog-heading" className="section-space">
        <PageContainer>
          <SectionHeading eyebrow="The shortlist" title="Featured hardware." id="catalog-heading" href="/shop" linkLabel="View all products" />
          <CatalogNotice />
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2">{products.filter((product) => product.featured).slice(0, 4).map((product) => <ProductCard key={product.id} product={product} imageSizes="(max-width: 639px) 100vw, 50vw" />)}</div>
        </PageContainer>
      </section>
      <section className="section-space border-y border-neutral-200 bg-neutral-50"><PageContainer><SectionHeading eyebrow="Find your starting point" title="Every part has a purpose." href="/categories" linkLabel="Shop by category" /><CategoryGrid /></PageContainer></section>
      <section className="dark-surface section-space bg-neutral-950 text-white"><PageContainer className="grid gap-12 lg:grid-cols-2 lg:gap-24"><div><p className="eyebrow text-neutral-400">Why Malak Computers</p><h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-5xl">Good hardware.<br /><span className="text-neutral-500">Clear conversations.</span></h2><p className="mt-7 max-w-sm text-xs leading-7 text-neutral-400">We’re a Pakistan-based computer hardware business sourcing products through suppliers in China. Our storefront keeps the product details and the ordering conversation together.</p><Link href="/about" className="text-link mt-6 text-white">Get to know Malak<Icon name="arrow-up" /></Link></div><div className="divide-y divide-white/15">{[{ number: "01", title: "Compare the details", text: "Browse specifications and product information before choosing a component." }, { number: "02", title: "Talk directly", text: "Take your shortlist to WhatsApp and ask about the exact item you’re considering." }, { number: "03", title: "Confirm personally", text: "Stock, delivery, payment and final order details are confirmed in conversation." }].map((item) => <div key={item.number} className="flex gap-6 py-7 first:pt-0"><span className="pt-1 text-[10px] text-neutral-400">{item.number}</span><div><h3 className="text-lg font-medium tracking-tight">{item.title}</h3><p className="mt-3 max-w-sm text-xs leading-7 text-neutral-400">{item.text}</p></div></div>)}</div></PageContainer></section>
      <OrderingSteps />
    </>
  );
}
