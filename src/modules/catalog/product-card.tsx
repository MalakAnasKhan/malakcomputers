import Image from "next/image";
import Link from "next/link";
import { formatPrice, stockLabels } from "./presentation";
import { OrderButton } from "./order-button";
import { Icon } from "@/components/ui/icon";
import type { Product } from "./types";

export function ProductCard({ product, imageSizes = "(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw" }: { product: Product; imageSizes?: string }) {
  return <article className="product-card" data-product-card={product.slug}>
    <Link href={"/products/" + product.slug} aria-label={"View " + product.name}>
      <div className="product-card-image"><Image src={product.images[0].src} alt={product.images[0].alt} fill sizes={imageSizes} className="object-contain" />{product.isSample && <span className="sample-badge">Sample</span>}</div>
      <div className="product-card-body"><div className="flex items-center justify-between gap-3"><p className="product-card-category">{product.category}</p><Icon name="arrow-up" width="16" height="16" /></div><h3>{product.name}</h3><p className="mt-1 text-[10px] text-neutral-500">{product.brand === "Not specified" ? "Brand awaiting approval" : product.brand}</p><p className="product-card-price">{formatPrice(product.pricePkr)}</p><p className="product-card-stock"><span aria-hidden="true" className={"h-1.5 w-1.5 rounded-full " + (product.stockStatus === "in-stock" ? "bg-graphite" : "bg-neutral-300")} />{stockLabels[product.stockStatus]}</p><span className="text-link mt-3">View details<Icon name="arrow" width="16" height="16" /></span></div>
    </Link>
    <div className="product-card-footer"><OrderButton product={product} className="w-full" /></div>
  </article>;
}
