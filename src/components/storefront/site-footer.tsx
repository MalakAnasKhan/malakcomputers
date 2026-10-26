import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { site } from "@/lib/site";
import { policies } from "@/modules/storefront/policies";
import { generalEnquiryUrl } from "@/lib/whatsapp";
import { Icon } from "@/components/ui/icon";

export function SiteFooter() {
  const whatsapp = generalEnquiryUrl();
  return <footer id="contact" className="dark-surface mt-auto bg-neutral-950 text-white"><PageContainer>
    <div className="grid gap-10 border-b border-white/15 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.4fr] lg:gap-12 lg:py-20">
      <div><Link href="/" className="text-sm font-semibold tracking-[0.14em]">{site.name}</Link><p className="mt-5 max-w-xs text-xs leading-6 text-neutral-400">PC hardware for what comes next. Based in Pakistan, sourcing through suppliers in China.</p><p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-neutral-400">Consider the details. Build your way.</p></div>
      <nav aria-label="Shop links"><h2 className="eyebrow text-neutral-400">Explore</h2><ul className="mt-5 space-y-3 text-xs text-neutral-300">{[{ href: "/shop", label: "All products" }, { href: "/categories", label: "Categories" }, { href: "/about", label: "Our story" }, { href: "/#how-to-order", label: "How to order" }].map((link) => <li key={link.href}><Link href={link.href} className="inline-block py-1 hover:text-white">{link.label}</Link></li>)}</ul></nav>
      <nav aria-label="Policy links"><h2 className="eyebrow text-neutral-400">Information</h2><ul className="mt-5 space-y-3 text-xs text-neutral-300">{policies.map((policy) => <li key={policy.slug}><Link href={`/policies/${policy.slug}`} className="inline-block py-1 hover:text-white">{policy.title}</Link></li>)}</ul><p className="mt-4 text-[10px] text-neutral-400">Policies awaiting approval</p></nav>
      <div><h2 className="eyebrow text-neutral-400">Let’s talk hardware</h2><div className="mt-5 space-y-3 text-xs leading-6 text-neutral-300">{whatsapp ? <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp (opens in a new tab)" className="inline-flex min-h-11 items-center gap-3 border-b border-neutral-500">Chat on WhatsApp<Icon name="arrow-up" /></a> : <p>WhatsApp number awaiting approval.</p>}{site.contact.email && <p><a href={`mailto:${site.contact.email}`} className="break-all hover:text-white">{site.contact.email}</a></p>}{site.contact.phone && <p>{site.contact.phone}</p>}{site.contact.address && <p>{site.contact.address}</p>}<Link href="/contact" className="text-link mt-2 text-white">Contact us<Icon name="arrow" /></Link></div>{site.socials.length > 0 && <div className="mt-5 flex flex-wrap gap-4">{site.socials.map((social) => <a key={social.url} href={social.url} target="_blank" rel="noopener noreferrer" className="py-2 text-xs underline underline-offset-4">{social.label}</a>)}</div>}</div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 py-6 text-[10px] leading-5 text-neutral-400"><span>{site.name} · Pakistan</span><span>{site.preview ? "Catalog preview · Sample products are not available to order." : "Orders and payment are confirmed manually on WhatsApp."}</span></div>
  </PageContainer></footer>;
}
