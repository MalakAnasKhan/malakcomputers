"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { Product } from "./types";

export function ProductGallery({ images, name, isSample }: Pick<Product, "images" | "name" | "isSample">) {
  const [active, setActive] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const stageId = useId();
  const image = images[active];
  return <section aria-label={name + " image gallery"}>
    <div id={stageId} className="gallery-stage"><Image src={image.src} alt={image.alt} fill priority={active === 0} sizes="(max-width: 1023px) 100vw, 50vw" className={showFullImage ? "object-contain" : "object-cover"} />{isSample && <span className="sample-badge">Sample listing</span>}</div>
    <div className="mt-3 flex min-h-11 items-center justify-between gap-4 text-[11px]">
      <button type="button" aria-pressed={showFullImage} aria-controls={stageId} onClick={() => setShowFullImage(!showFullImage)} className="gallery-fit-toggle">Show full image</button>
      <p className="text-neutral-500" aria-live="polite">{showFullImage ? "Full image, no cropping" : "Fill frame"}</p>
    </div>
    <div className="mt-4 flex items-start justify-between gap-4"><div className="flex flex-wrap gap-3" aria-label="Select a product image">{images.map((item, index) => <button type="button" key={item.src + "-" + index} onClick={() => setActive(index)} aria-label={"View image " + (index + 1) + ": " + item.alt} aria-pressed={active === index} className="gallery-thumb"><Image src={item.src} alt="" fill sizes="72px" className="object-cover" /></button>)}</div><p className="shrink-0 pt-2 text-[10px] text-neutral-500" aria-live="polite">{active + 1} / {images.length}</p></div>
    {isSample && <p className="mt-4 text-[10px] leading-6 text-neutral-500">Sample listing only. This product is not offered for sale.</p>}
  </section>;
}
