"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "./types";

export function ProductGallery({ images, name, isSample }: Pick<Product, "images" | "name" | "isSample">) {
  const [active, setActive] = useState(0);
  const image = images[active];
  return <section aria-label={`${name} image gallery`}>
    <div className="relative aspect-square overflow-hidden bg-[#f2f2ef]"><Image src={image.src} alt={image.alt} fill priority={active === 0} sizes="(max-width: 1023px) 100vw, 50vw" className="object-contain p-8 sm:p-14" />{isSample && <span className="absolute left-5 top-5 border border-neutral-200 bg-white px-3 py-1.5 text-[9px] font-semibold uppercase tracking-widest">Sample listing</span>}</div>
    <div className="mt-4 flex items-start justify-between gap-5"><div className="flex flex-wrap gap-3" aria-label="Select a product image">{images.map((item, index) => <button type="button" key={`${item.src}-${index}`} onClick={() => setActive(index)} aria-label={`View image ${index + 1}: ${item.alt}`} aria-pressed={active === index} className={`relative h-16 w-16 border bg-neutral-50 sm:h-20 sm:w-20 ${active === index ? "border-neutral-950" : "border-neutral-200 hover:border-neutral-500"}`}><Image src={item.src} alt="" fill sizes="80px" className="object-contain p-2" /></button>)}</div><p className="shrink-0 pt-2 text-[10px] text-neutral-500" aria-live="polite">{active + 1} / {images.length}</p></div>
    {isSample && <p className="mt-4 text-[10px] leading-6 text-neutral-500">Sample listing only. This product is not offered for sale.</p>}
  </section>;
}
