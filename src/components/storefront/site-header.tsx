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
  function isActive(href: string) { return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`) || href === "/shop" && pathname.startsWith("/products/"); }
  return <>
    <div className="dark-surface bg-neutral-950 py-2.5 text-[9px] uppercase tracking-[0.18em] text-neutral-300"><PageContainer className="flex items-center justify-between gap-4"><span>PC hardware · Pakistan</span><span className="hidden sm:block">Browse. Enquire. Build.</span>{site.preview && <span>Catalog preview</span>}</PageContainer></div>
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white" onKeyDown={(event) => { if (event.key === "Escape" && open) { setOpen(false); button.current?.focus(); } }}>
      <PageContainer className="flex min-h-20 items-center justify-between gap-5">
        <Link href="/" aria-label={`${site.name} homepage`} onClick={() => setOpen(false)} className="flex shrink-0 items-center gap-3"><span aria-hidden="true" className="grid h-10 w-10 place-items-center bg-neutral-950 text-sm font-semibold tracking-[-0.08em] text-white">MC</span><span className="max-w-24 text-[11px] font-semibold leading-[1.45] tracking-[0.14em] sm:text-xs">{site.name}</span></Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">{navigation.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={`border-b py-2 text-xs transition-colors ${isActive(item.href) ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-500 hover:border-neutral-400 hover:text-neutral-950"}`}>{item.label}</Link>)}</nav>
        <div className="flex items-center gap-2 sm:gap-5"><Link href="/shop#search" aria-label="Search products" className="hidden h-11 w-11 place-items-center hover:bg-neutral-100 min-[400px]:grid"><Icon name="search" /></Link>{chat ? <a href={chat} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp (opens in a new tab)" className="flex min-h-11 min-w-11 items-center justify-center gap-3 border border-neutral-950 bg-neutral-950 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-neutral-700 sm:min-h-12 sm:px-5"><span className="hidden sm:inline">Chat on WhatsApp</span><Icon name="chat" /></a> : <Link href="/shop" className="button hidden sm:inline-flex">Explore the shop <Icon name="arrow-up" /></Link>}<button ref={button} type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center lg:hidden"><Icon name={open ? "close" : "menu"} /></button></div>
      </PageContainer>
      <nav id="mobile-navigation" hidden={!open} aria-label="Mobile navigation" className="border-t border-neutral-200 bg-white lg:hidden"><PageContainer className="py-3">{navigation.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-between border-b border-neutral-100 py-3 text-sm last:border-0">{item.label}<Icon name="arrow-up" /></Link>)}</PageContainer></nav>
      <noscript><nav aria-label="Mobile navigation without JavaScript" className="border-t border-neutral-200 lg:hidden"><PageContainer className="flex flex-wrap gap-x-6 py-3">{navigation.map((item) => <Link key={item.href} href={item.href} className="py-3 text-xs">{item.label}</Link>)}</PageContainer></nav></noscript>
    </header>
  </>;
}
