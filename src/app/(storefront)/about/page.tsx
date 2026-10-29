import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { Breadcrumbs } from "@/components/storefront/breadcrumbs";
import { ContactCta } from "@/components/storefront/contact-cta";
import { OrderingSteps } from "@/components/storefront/ordering-steps";
import { EditorialImage } from "@/components/storefront/editorial-image";
import { MotionElement } from "@/components/storefront/motion-element";
import { Icon } from "@/components/ui/icon";
import { categoryDetails } from "@/modules/catalog/categories";
import { pageMetadata } from "@/modules/storefront/seo";

export const metadata = pageMetadata(
  "Our Story",
  "Discover how Malak Computers began with a graphics card in 2022 and grew into a Pakistan-based computer hardware business sourcing components and serving customers nationwide.",
  "/about",
);

export default function AboutPage() {
  return <div className="founder-story">
    <section className="founder-hero" aria-labelledby="founder-heading">
      <PageContainer>
        <Breadcrumbs items={[{ label: "About" }]} />
        <p className="eyebrow">Our Story · Malak Computers</p>
        <h1 id="founder-heading">It Started With a Graphics Card That <span>Didn’t Fit.</span></h1>
        <div className="founder-hero-bottom">
          <p>From a gaming dream in 2022 to a computer hardware business serving customers across Pakistan.</p>
          <a href="#the-beginning" className="text-link">Read our story<Icon name="arrow" /></a>
        </div>
      </PageContainer>
    </section>

    <section id="the-beginning" className="founder-chapter" aria-labelledby="beginning-heading">
      <PageContainer>
        <div className="founder-split">
          <MotionElement className="founder-prose">
            <p className="eyebrow">01 / A gaming dream · 2022</p>
            <h2 id="beginning-heading">Every Great Build Starts Somewhere.</h2>
            <p>In 2022, I saved money for a graphics card. I wanted a better gaming experience, so I went to the local market to see what I could buy. An RX 550 cost approximately PKR 18,000—more than I could comfortably spend.</p>
            <p>Back home, I kept searching online. I found an RX 580 8GB for PKR 17,000 from a verified seller. I was excited to find it at that price, and I ordered the card.</p>
            <p>Then it arrived. After all that anticipation, there was one problem: it didn’t fit my computer.</p>
          </MotionElement>
          <EditorialImage kind="story" />
        </div>
      </PageContainer>
    </section>

    <section className="founder-chapter founder-profit" aria-labelledby="profit-heading">
      <PageContainer>
        <div className="founder-split">
          <MotionElement className="founder-prose">
            <p className="eyebrow">02 / An unexpected beginning</p>
            <h2 id="profit-heading">The First Rs. 5,000</h2>
            <p>I couldn’t use the card, but I didn’t want to leave it sitting unused. I listed it on a Pakistani marketplace and sold it for PKR 22,000. I had bought it for PKR 17,000, so that left me with my first PKR 5,000 trading profit.</p>
            <p>Until then, I had only been thinking about gaming. That sale gave me another idea. I reinvested the money in another graphics card, then gradually bought more. One purchase that hadn’t worked out was turning into a small business.</p>
          </MotionElement>
          <MotionElement className="founder-ledger">
            <p className="eyebrow">One graphics card. A new direction.</p>
            <dl>
              <div><dt>Purchased for</dt><dd><span>PKR</span> 17,000</dd></div>
              <div><dt>Sold for</dt><dd><span>PKR</span> 22,000</dd></div>
              <div className="founder-ledger-result"><dt>First trading profit</dt><dd><span>PKR</span> 5,000</dd></div>
            </dl>
            <p className="founder-small">Figures from my first trade—not current product pricing.</p>
          </MotionElement>
        </div>
      </PageContainer>
    </section>

    <section className="founder-chapter" aria-labelledby="setback-heading">
      <PageContainer>
        <div className="founder-split">
          <MotionElement className="founder-prose">
            <p className="eyebrow">03 / The difficult part</p>
            <h2 id="setback-heading">Then I Lost Almost Everything.</h2>
            <p className="founder-loss-scope">Almost everything invested in one shipment. Not the entire business.</p>
            <p>Later, I bought a bulk shipment and ran into costs I hadn’t expected: taxes, shipping and delivery expenses. Some of the products didn’t work. Together, those problems meant a loss of approximately 80% of the investment in that shipment.</p>
            <p>It was painful. I had built up that money one graphics card at a time. My family was upset, but my father remained supportive. His support mattered when I was trying to work out how to move forward.</p>
            <p>I couldn’t undo the loss. I could learn from it, though, and start again more carefully.</p>
          </MotionElement>
          <MotionElement className="founder-loss-note dark-surface">
            <p className="eyebrow">One shipment. A difficult lesson.</p>
            <p className="founder-loss-figure"><span>Approximately</span><strong>80%</strong><span>of that shipment’s investment lost</span></p>
            <p className="founder-loss-caption">Not 80% of the entire business.</p>
            <p className="founder-loss-lesson">Before I bought more, I needed to understand the hardware—and everything it takes to bring it here.</p>
          </MotionElement>
        </div>
      </PageContainer>
    </section>

    <section className="founder-chapter" aria-labelledby="learning-heading">
      <PageContainer>
        <div className="founder-split">
          <MotionElement className="founder-prose">
            <p className="eyebrow">04 / Starting again</p>
            <h2 id="learning-heading">Learning Before Growing.</h2>
            <p>I spent more time learning about computer components, compatibility, suppliers and international sourcing. Along the way, I built relationships with hardware suppliers in China.</p>
            <p>I started again with individual graphics cards and smaller orders. It was gradual. As I learned more, I began buying motherboards, processors and other computer hardware too.</p>
            <p>That first card had taught me to pay attention to compatibility. The difficult shipment taught me to look beyond the purchase price. Both experiences still shape how I think about hardware.</p>
          </MotionElement>
          <MotionElement className="founder-learning-note">
            <p className="eyebrow">A more careful approach</p>
            <p className="founder-note-title">Understand the part.<br />Then take the next step.</p>
            <ul>{["Components & compatibility", "Suppliers & sourcing", "The cost beyond the purchase"].map(item => <li key={item}><Icon name="check" />{item}</li>)}</ul>
          </MotionElement>
        </div>
      </PageContainer>
    </section>

    <section className="founder-chapter founder-today" aria-labelledby="today-heading">
      <PageContainer>
        <div className="founder-split">
          <MotionElement className="founder-prose">
            <p className="eyebrow">05 / Malak Computers today</p>
            <h2 id="today-heading">Built From Experience. Driven by Passion.</h2>
            <p>That journey became Malak Computers. Today, we serve customers across Pakistan with graphics cards, motherboards, processors and other hardware. I started as someone trying to buy a graphics card for my own computer, and I haven’t forgotten what that felt like.</p>
            <p>We care about quality, reasonable pricing and clear information. We want you to feel comfortable asking questions, checking compatibility and understanding the details before you decide. That’s why a personal conversation is still part of how we work.</p>
          </MotionElement>
          <MotionElement className="founder-category-panel">
            <p className="eyebrow">Find your next component</p>
            <nav aria-label="Explore hardware from our story">
              {categoryDetails.map(category => <Link key={category.slug} href={`/categories/${category.slug}`}>{category.name}<Icon name="arrow-up" /></Link>)}
              <Link href="/shop">All hardware<Icon name="arrow-up" /></Link>
            </nav>
            <p className="founder-small">Browse the catalog, then ask about the exact part. Current price and availability are confirmed on WhatsApp.</p>
          </MotionElement>
        </div>
      </PageContainer>
    </section>

    <section className="founder-chapter" aria-labelledby="store-heading">
      <PageContainer>
        <div className="founder-split">
          <MotionElement className="founder-prose">
            <p className="eyebrow">06 / A direct conversation</p>
            <h2 id="store-heading">More Than a Computer Store.</h2>
            <p>The storefront gives you a place to explore hardware and put together a shortlist. Product pages lead to a WhatsApp enquiry, where we can discuss the item, current price, availability, condition and warranty eligibility.</p>
            <p>Orders and payment arrangements are confirmed personally on WhatsApp. We also discuss delivery to your city, shipping charges and dispatch details there. There is no automated checkout or payment on this website.</p>
            <p>Need help before choosing, or have a question after delivery? <Link href="/contact">Talk to our team.</Link> For delivery and after-sales terms, see our <Link href="/policies/shipping">Shipping Policy</Link> and <Link href="/policies/returns">Returns &amp; Warranty Policy</Link>.</p>
          </MotionElement>
          <MotionElement className="founder-contact-note">
            <p className="eyebrow">Your next build</p>
            <p className="founder-note-title">A question.<br />A real conversation.</p>
            <ContactCta compact />
            <Link href="/contact" className="text-link">Get in touch<Icon name="arrow-up" /></Link>
          </MotionElement>
        </div>
      </PageContainer>
    </section>

    <OrderingSteps />

    <section className="founder-closing dark-surface" aria-labelledby="closing-heading">
      <PageContainer>
        <MotionElement>
          <p className="eyebrow">The next chapter</p>
          <h2 id="closing-heading">Our Story Is Still Being Written.</h2>
          <div className="founder-closing-actions"><Link href="/shop" className="button button-outline">Explore Products<Icon name="arrow-up" /></Link><ContactCta compact /></div>
          <p className="founder-closing-line">We started with a graphics card that didn&apos;t fit. Now, we&apos;re helping others find the hardware that does.</p>
        </MotionElement>
      </PageContainer>
    </section>
  </div>;
}
