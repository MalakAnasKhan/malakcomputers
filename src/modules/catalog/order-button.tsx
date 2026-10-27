import { site } from "@/lib/site";
import { Icon } from "@/components/ui/icon";
import { productEnquiryUrl, productDetailsEnquiryUrl } from "./presentation";
import type { Product } from "./types";

export function OrderButton({ product, className = "" }: { product: Product; className?: string }) {
  const url = productEnquiryUrl(product, site.whatsappNumber);
  if (url) return <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Order ${product.name} on WhatsApp (opens in a new tab)`} className={`button ${className}`}>Order on WhatsApp<Icon name="chat" /></a>;
  const enquiry = productDetailsEnquiryUrl(product, site.whatsappNumber);
  if (enquiry) return <a href={enquiry} target="_blank" rel="noopener noreferrer" aria-label={`Ask about ${product.name} on WhatsApp (opens in a new tab)`} className={`button ${className}`}>Enquire on WhatsApp<Icon name="chat" /></a>;
  return <button type="button" disabled className={`button ${className}`}>{product.isSample ? "Sample — ordering unavailable" : product.stockStatus === "out-of-stock" ? "Out of stock" : "Ordering not yet available"}</button>;
}
