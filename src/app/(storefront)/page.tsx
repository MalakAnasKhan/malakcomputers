import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { products } from "@/modules/catalog/products";
import { ProductCard } from "@/modules/catalog/product-card";
import { CategoryGrid } from "@/components/storefront/category-grid";
import { SectionHeading } from "@/components/storefront/section-heading";
import { CatalogNotice } from "@/components/storefront/catalog-notice";
import { OrderingSteps } from "@/components/storefront/ordering-steps";
import { EditorialImage } from "@/components/storefront/editorial-image";
import { FinalCta } from "@/components/storefront/final-cta";
import { Icon } from "@/components/ui/icon";
import { pageMetadata } from "@/modules/storefront/seo";

export const metadata = pageMetadata("PC hardware for what’s next", "Explore PC hardware with Malak Computers, a Pakistan-based business. Browse components and confirm your order personally on WhatsApp.", "/");

export default function HomePage() {
  return <>
    <section className="hero-section">
      <PageContainer>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow" data-hero-entry>PC hardware. Personal possibilities.</p>
            <h1 data-hero-entry>Your next build.<br />A better<br /><span>starting point.</span></h1>
            <p className="hero-description" data-hero-entry>For the games, the work, the ideas still to come. Explore computer components with Malak Computers. Build something that feels like you.</p>
            <div className="hero-actions" data-hero-entry><Link href="/shop" className="button">Shop now<Icon name="arrow-up" /></Link><Link href="/categories" className="text-link">Explore categories<Icon name="arrow" /></Link></div>
            <div className="hero-note" data-hero-entry><span className="note-icon"><Icon name="chat" width="15" height="15" /></span><span>Based in Pakistan.<br />Order details confirmed on WhatsApp.</span></div>
          </div>
          <EditorialImage kind="hero" priority />
        </div>
        <div className="hero-bottom"><span>THE COMPONENTS BEHIND WHAT’S NEXT.</span><div className="hero-bottom-links"><Link href="/categories/graphics-cards">Graphics cards</Link><Link href="/categories/processors">Processors</Link><Link href="/categories/memory">Memory</Link><Link href="/categories/storage">Storage</Link></div><Link href="#how-to-order" className="text-link">How to order<Icon name="arrow" /></Link></div>
      </PageContainer>
    </section>
    <section className="section-space" aria-labelledby="categories-heading">
      <PageContainer><div data-reveal><SectionHeading eyebrow="Find your starting point" title="A place for every part." id="categories-heading" href="/categories" linkLabel="All categories" /></div><CategoryGrid /></PageContainer>
    </section>
    <section id="catalog" aria-labelledby="catalog-heading" className="dark-surface section-space bg-graphite text-white">
      <PageContainer><div data-reveal><SectionHeading eyebrow="The hardware edit" title="Worth a closer look." id="catalog-heading" href="/shop" linkLabel="Explore the shop" /><CatalogNotice /></div><div className="mt-8 grid gap-5 sm:grid-cols-2">{products.filter(product => product.featured).slice(0, 4).map(product => <ProductCard key={product.id} product={product} imageSizes="(max-width: 639px) 100vw, 50vw" />)}</div></PageContainer>
    </section>
    <section className="section-space">
      <PageContainer><div className="story-grid"><div data-reveal><EditorialImage kind="story" /></div><div className="story-copy" data-reveal><p className="eyebrow">Why Malak Computers</p><h2 className="section-title">Considered hardware.<br />Human conversations.</h2><p>Every build starts with a reason. A new project. A favourite game. Something you want to make. The right components bring it a little closer.</p><p>We’re a Pakistan-based computer hardware business sourcing products through suppliers in China. Browse the details here, then discuss the exact item with us on WhatsApp.</p><div className="story-highlight"><Icon name="chat" /><span>Your shortlist. A direct conversation.</span></div><Link href="/about" className="text-link">Our story<Icon name="arrow-up" /></Link></div></div></PageContainer>
    </section>
    <OrderingSteps />
    <FinalCta />
  </>;
}
