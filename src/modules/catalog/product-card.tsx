import Image from "next/image";
import Link from "next/link";
import { formatPrice, stockLabels } from "./presentation";
import type { Product } from "./types";
import { OrderButton } from "./order-button";

export function ProductCard({ product, imageSizes = "(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw" }: { product: Product; imageSizes?: string }) {
  return (
    <article className="group flex min-w-0 flex-col" data-product-card={product.slug}>
      <Link href={`/products/${product.slug}`} className="block" aria-label={`View ${product.name}`}>
        <div className="relative aspect-[5/4] overflow-hidden bg-[#f2f2ef]">
          <Image src={product.images[0].src} alt={product.images[0].alt} fill sizes={imageSizes} className="object-contain p-8 transition-transform duration-200 motion-safe:group-hover:scale-105 motion-reduce:transition-none" />
          {product.isSample && <span className="absolute left-4 top-4 border border-neutral-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-widest">Sample</span>}
        </div>
        <div className="pt-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">{product.category}</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight group-hover:underline underline-offset-4">{product.name}</h3>
          <p className="mt-3 text-sm font-semibold">{formatPrice(product.pricePkr)}</p>
          <p className="mt-2 flex items-center gap-2 text-[10px] text-neutral-500"><span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${product.stockStatus === "in-stock" ? "bg-neutral-950" : "bg-neutral-300"}`} />{stockLabels[product.stockStatus]}</p>
          <span className="mt-5 inline-block text-xs font-semibold">View details <span aria-hidden="true">↗</span></span>
        </div>
      </Link>
      <div className="mt-auto pt-5"><OrderButton product={product} className="w-full gap-2 px-3 text-[10px]" /></div>
    </article>
  );
}
