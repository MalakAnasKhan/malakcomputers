"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { Icon } from "@/components/ui/icon";
import { site } from "@/lib/site";
import { generalEnquiryUrl } from "@/lib/whatsapp";

const navigation = [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Categories", href: "/categories" }, { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const chat = generalEnquiryUrl();
  function isActive(href: string) { return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/") || href === "/shop" && pathname.startsWith("/products/"); }
  return <>
    <div className="dark-surface bg-graphite py-2.5 text-[9px] tracking-[0.1em] text-neutral-300"><PageContainer className="flex items-center justify-between gap-4"><span>PC hardware, with a personal touch.</span><span className="hidden sm:block">Pakistan · Enquiries on WhatsApp</span>{site.preview && <span className="flex shrink-0 items-center gap-2"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lime" />Catalog preview</span>}</PageContainer></div>
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-background" onKeyDown={event => { if (event.key === "Escape" && open) { setOpen(false); button.current?.focus(); } }}>
      <PageContainer className="flex min-h-20 items-center justify-between gap-4 lg:min-h-24">
        <Link href="/" aria-label={site.name + " homepage"} onClick={() => setOpen(false)} className="flex shrink-0 items-center gap-3"><span aria-hidden="true" className="brand-mark">MC</span><span className="max-w-24 text-[11px] font-semibold leading-[1.45] tracking-[0.12em] sm:text-xs">{site.name}</span></Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">{navigation.map(item => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className="navigation-link">{item.label}</Link>)}</nav>
        <div className="flex items-center gap-2 sm:gap-4"><Link href="/shop#search" aria-label="Search products" className="hidden h-11 w-11 place-items-center rounded-full hover:bg-neutral-100 min-[400px]:grid"><Icon name="search" /></Link>{chat && <a href={chat} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp (opens in a new tab)" className="flex min-h-11 min-w-11 items-center justify-center gap-3 rounded-full bg-lime px-3 text-[11px] font-semibold text-graphite transition-colors hover:bg-[#C3EE2B] sm:min-h-12 sm:px-5"><span className="hidden sm:inline">Let’s talk</span><Icon name="chat" /></a>}<button ref={button} type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-full border border-neutral-200 lg:hidden"><Icon name={open ? "close" : "menu"} /></button></div>
      </PageContainer>
      <nav id="mobile-navigation" hidden={!open} aria-label="Mobile navigation" className="border-t border-neutral-200 bg-background lg:hidden"><PageContainer className="py-3">{navigation.map(item => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-between border-b border-neutral-200 py-3 text-sm last:border-0">{item.label}<Icon name="arrow-up" /></Link>)}</PageContainer></nav>
      <noscript><nav aria-label="Mobile navigation without JavaScript" className="border-t border-neutral-200 lg:hidden"><PageContainer className="flex flex-wrap gap-x-6 py-3">{navigation.map(item => <Link key={item.href} href={item.href} className="py-3 text-xs">{item.label}</Link>)}</PageContainer></nav></noscript>
    </header>
  </>;
}
