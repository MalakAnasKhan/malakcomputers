"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { categories, type Category, type Product } from "./types";
import { defaultFilters, filterProducts, filterQuery, readFilters, type CatalogFilters } from "./filters";
import { ProductCard } from "./product-card";
import { Icon } from "@/components/ui/icon";

const filterEvent = "malak:catalog-filters";
function subscribeToLocation(notify: () => void) {
  window.addEventListener("popstate", notify);
  window.addEventListener(filterEvent, notify);
  return () => {
    window.removeEventListener("popstate", notify);
    window.removeEventListener(filterEvent, notify);
  };
}
function locationSearch() { return window.location.search; }

export function ShopCatalog({ catalog, fixedCategory }: { catalog: readonly Product[]; fixedCategory?: Category }) {
  const searchParams = useSearchParams();
  // Native history restores are transitions in Next. A synchronous external
  // snapshot keeps controlled text input/caret updates immediate while typing.
  // useSearchParams also subscribes us to navigation initiated by Next links.
  const queryString = useSyncExternalStore(subscribeToLocation, locationSearch, () => searchParams.toString());
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filters = readFilters(new URLSearchParams(queryString), catalog, fixedCategory);
  const results = filterProducts(catalog, filters);
  const brands = [...new Set(catalog.filter((product) => !fixedCategory || product.category === fixedCategory).map((product) => product.brand))].sort();
  const activeCount = Number(Boolean(filters.query)) + Number(filters.brand !== "all") + Number(filters.availability !== "all") + Number(!fixedCategory && filters.category !== "all");

  function update(next: CatalogFilters) {
    const query = filterQuery(next, fixedCategory);
    // Next's native History API integration updates useSearchParams without a
    // reload, server request, lost input focus or per-keystroke history entries.
    window.history.replaceState(null, "", `${pathname}${query ? `?${query}` : ""}`);
    window.dispatchEvent(new Event(filterEvent));
  }
  function clear() { update({ ...defaultFilters, category: fixedCategory ?? "all" }); }

  return <div className="mt-8 pb-16 sm:pb-24">
    <div className="flex flex-wrap items-center gap-4 border-y border-neutral-200 py-5">
      <form role="search" onSubmit={(event) => event.preventDefault()} className="relative min-w-0 flex-1 basis-full sm:basis-auto"><label htmlFor="product-search" className="sr-only">Search products by name, SKU, brand or specification</label><Icon name="search" className="pointer-events-none absolute left-4 top-3.5 text-neutral-500" /><input id="product-search" type="search" autoComplete="off" maxLength={120} placeholder="Search components, brands, specifications…" value={filters.query} onChange={(event) => update({ ...filters, query: event.target.value })} className="field pl-12" /></form>
      <div className="flex w-full items-center justify-between gap-4 sm:w-auto"><button type="button" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={() => setFiltersOpen(!filtersOpen)} className="text-link lg:hidden"><Icon name="filter" />Filters{activeCount ? ` (${activeCount})` : ""}</button><label className="flex items-center gap-3 text-[11px]"><span className="shrink-0 text-neutral-500">Sort by</span><select aria-label="Sort products" className="field min-w-0 sm:w-44" value={filters.sort} onChange={(event) => update({ ...filters, sort: event.target.value as CatalogFilters["sort"] })}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name: A–Z</option></select></label></div>
    </div>
    <div className="mt-8 grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
      <aside id="catalog-filters" aria-label="Product filters" className={`${filtersOpen ? "block" : "hidden"} border-b border-neutral-200 pb-8 lg:block lg:border-0`}>
        <div className="mb-7 flex items-center justify-between gap-4"><h2 className="text-sm font-semibold">Filter products</h2><button type="button" onClick={clear} disabled={activeCount === 0 && filters.sort === "featured"} className="min-h-11 text-[10px] text-neutral-500 underline underline-offset-4 disabled:cursor-default disabled:opacity-40">Clear all</button></div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {!fixedCategory && <label className="space-y-3 text-[11px] font-medium"><span className="block">Category</span><select value={filters.category} onChange={(event) => update({ ...filters, category: event.target.value as CatalogFilters["category"] })} className="field font-normal"><option value="all">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>}
          <label className="space-y-3 text-[11px] font-medium"><span className="block">Brand</span><select className="field font-normal" value={filters.brand} onChange={(event) => update({ ...filters, brand: event.target.value })}><option value="all">All brands</option>{brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select></label>
          <label className="space-y-3 text-[11px] font-medium"><span className="block">Availability</span><select className="field font-normal" value={filters.availability} onChange={(event) => update({ ...filters, availability: event.target.value as CatalogFilters["availability"] })}><option value="all">All availability</option><option value="in-stock">In stock</option><option value="on-request">On request</option><option value="out-of-stock">Out of stock</option><option value="unconfirmed">To be confirmed</option></select></label>
        </div>
        <p className="mt-8 border-t border-neutral-200 pt-5 text-[10px] leading-6 text-neutral-500">Prices shown in PKR. Final stock, delivery charges and payment details are confirmed on WhatsApp.</p>
      </aside>
      <div className="min-w-0"><h2 className="sr-only">Product listings</h2><div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-[11px]"><p role="status" aria-live="polite" aria-atomic="true">{results.length} {results.length === 1 ? "product" : "products"}{filters.query.trim() ? ` matching “${filters.query.trim()}”` : ""}</p>{activeCount > 0 && <button onClick={clear} className="min-h-11 text-neutral-500 underline underline-offset-4">Reset filters</button>}</div>
        {results.length ? <div id="catalog-results" className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">{results.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div id="catalog-results" className="flex min-h-80 flex-col items-center justify-center border border-neutral-200 bg-neutral-50 px-5 py-12 text-center"><Icon name="search" width="30" height="30" className="text-neutral-400" /><h2 className="mt-6 text-xl font-semibold tracking-tight">No matching components.</h2><p className="mt-3 max-w-sm text-xs leading-6 text-neutral-500">Try a different search or clear the filters. Sample listings do not imply confirmed stock.</p><button onClick={clear} className="button button-outline mt-7">Clear filters<Icon name="arrow" /></button></div>}
      </div>
    </div>
  </div>;
}
