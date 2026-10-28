import { PageContainer } from "@/components/layout/page-container";
import { PageIntro } from "@/components/storefront/page-intro";
import { ContactCta } from "@/components/storefront/contact-cta";
import { OrderingSteps } from "@/components/storefront/ordering-steps";
import { EditorialImage } from "@/components/storefront/editorial-image";
import { FinalCta } from "@/components/storefront/final-cta";
import { pageMetadata } from "@/modules/storefront/seo";

export const metadata = pageMetadata("About Malak Computers", "Meet Malak Computers, a Pakistan-based computer hardware business with personal product enquiries and order confirmation on WhatsApp.", "/about");
export default function AboutPage() {
  return <><PageContainer><PageIntro eyebrow="A little about us" title="Hardware with a human side." description="A game you want to play. A project you want to finish. An idea you want to bring to life. Every build starts somewhere." breadcrumbs={[{ label: "About" }]} /><div className="story-grid pb-16 sm:pb-24"><EditorialImage kind="story" priority /><div className="story-copy"><p className="eyebrow">Pakistan, with a wider perspective</p><h2 className="section-title">Good components.<br />Clear conversations.</h2><p>Malak Computers is a Pakistan-based computer hardware business. This storefront brings our product catalog together in one place, with enquiries and order confirmation handled personally on WhatsApp.</p><p>Explore the specifications, make a shortlist, and discuss the exact product you need. Availability, delivery arrangements, payment details and the final order are confirmed in that conversation.</p><div className="mt-8"><ContactCta compact /></div></div></div></PageContainer><OrderingSteps /><FinalCta /></>;
}
