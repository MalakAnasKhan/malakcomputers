import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { site, directionsUrl } from "@/lib/site";
import { policies } from "@/modules/storefront/policies";
import { generalEnquiryUrl } from "@/lib/whatsapp";
import { Icon } from "@/components/ui/icon";

export function SiteFooter() {
  const whatsapp = generalEnquiryUrl();
  const directions = directionsUrl();
  return <footer id="contact" className="site-footer dark-surface mt-auto"><PageContainer>
    <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.2fr] lg:gap-12 lg:py-16">
      <div><Link href="/" className="flex items-center gap-3"><span className="brand-mark" aria-hidden="true">MC</span><span className="text-xs font-semibold tracking-[0.12em]">{site.name}</span></Link><p className="mt-6 max-w-xs text-xs leading-7 text-neutral-400">The components behind what’s next. Based in Pakistan, sourcing hardware through suppliers in China.</p></div>
      <nav className="footer-nav" aria-label="Shop links"><h2 className="eyebrow">Find your next</h2><ul className="mt-5">{[{ href: "/shop", label: "Shop all hardware" }, { href: "/categories", label: "Shop by category" }, { href: "/about", label: "Our story" }, { href: "/#how-to-order", label: "How to order" }].map(link => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul></nav>
      <nav className="footer-nav" aria-label="Policy links"><h2 className="eyebrow">The details</h2><ul className="mt-5">{policies.map(policy => <li key={policy.slug}><Link href={"/policies/" + policy.slug}>{policy.title}</Link></li>)}</ul></nav>
      <div><h2 className="eyebrow">A direct conversation</h2><div className="mt-5 flex flex-col items-start gap-2 text-xs leading-6 text-neutral-300">{whatsapp && <><a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp (opens in a new tab)" className="text-link text-lime">Chat on WhatsApp<Icon name="arrow-up" /></a><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-white underline underline-offset-4">{site.contact.phone ?? `+${site.whatsappNumber}`}</a></>}{site.contact.email && <p><a href={"mailto:" + site.contact.email} className="break-all">{site.contact.email}</a></p>}{site.contact.address && <address className="not-italic text-[11px] leading-6">{site.contact.address}</address>}{directions && <a href={directions} target="_blank" rel="noopener noreferrer" aria-label="Get Directions on Google Maps (opens in a new tab)" className="inline-flex min-h-11 items-center gap-2 text-[11px] underline underline-offset-4">Get Directions<Icon name="arrow-up" width="14" height="14" /></a>}<Link href="/contact" className="text-link">Get in touch<Icon name="arrow" /></Link></div>{site.socials.length > 0 && <div className="mt-5 flex flex-wrap gap-4">{site.socials.map(social => <a key={social.url} href={social.url} target="_blank" rel="noopener noreferrer" className="py-2 text-xs underline underline-offset-4">{social.label}</a>)}</div>}</div>
    </div>
    <div className="flex flex-wrap justify-between gap-3 border-t border-white/15 py-6 text-[10px] leading-6 text-neutral-400"><span>{site.name} · Pakistan</span><span>{site.preview ? "Catalog preview · Sample products are not available to order." : "Orders and payment are confirmed manually on WhatsApp."}</span></div>
    <div className="footer-wordmark" aria-hidden="true">MALAK COMPUTERS.</div>
  </PageContainer></footer>;
}
