import { whatsappUrl } from "@/lib/whatsapp";
import { site } from "@/lib/site";
import { publicPageUrl } from "@/lib/urls";
import type { Product, StockStatus } from "./types";

export function formatPrice(pricePkr: number | null): string {
  return pricePkr === null ? "Price to be confirmed" : new Intl.NumberFormat("en-PK", {
    style: "currency", currency: "PKR", currencyDisplay: "code", maximumFractionDigits: 0,
  }).format(pricePkr);
}

export const stockLabels: Record<StockStatus, string> = {
  "in-stock": "In stock", "out-of-stock": "Out of stock", "on-request": "On request", "unconfirmed": "Availability to be confirmed",
};

export function isOrderableProduct(product: Product): boolean {
  return !product.isSample && ["in-stock", "on-request"].includes(product.stockStatus) &&
    product.pricePkr !== null && Number.isSafeInteger(product.pricePkr) && product.pricePkr >= 0;
}

export function productEnquiryUrl(product: Product, number: string | null, origin: string | null = site.url): string | null {
  if (!isOrderableProduct(product) || !number) return null;
  const page = publicPageUrl(`/products/${encodeURIComponent(product.slug)}`, origin);
  if (!page) return null;
  return whatsappUrl(number, `Hello ${site.name}, I would like to order:\n${product.name}\nProduct ID/SKU: ${product.id}\nPrice: ${formatPrice(product.pricePkr)}\nProduct page: ${page}\nPlease confirm current stock, delivery charges, payment details and instructions, and the order before I proceed. This is an enquiry, not a confirmed or paid order.`);
}
