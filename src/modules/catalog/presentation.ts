import { whatsappUrl } from "@/lib/whatsapp";
import { site } from "@/lib/site";
import { publicPageUrl } from "@/lib/urls";
import type { Product, StockStatus } from "./types";

export function formatPrice(pricePkr: number | null): string {
  return pricePkr === null ? "Price on request" : new Intl.NumberFormat("en-PK", {
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

/** Price/stock enquiry only, never an order or an availability claim. */
export function productDetailsEnquiryUrl(product: Product, number: string | null, origin: string | null = site.url): string | null {
  if (product.isSample || !number) return null;
  const path = `/products/${encodeURIComponent(product.slug)}`;
  const page = publicPageUrl(path, origin) ?? path;
  return whatsappUrl(number, `Hello ${site.name}, could you confirm the price and current availability of ${product.name}?\nProduct ID/SKU: ${product.id}\nProduct page: ${page}\nPlease also share delivery charges and product details. This is a general enquiry, not a confirmed or paid order.`);
}

export function productEnquiryUrl(product: Product, number: string | null, origin: string | null = site.url): string | null {
  if (!isOrderableProduct(product) || !number) return null;
  const page = publicPageUrl(`/products/${encodeURIComponent(product.slug)}`, origin);
  if (!page) return null;
  return whatsappUrl(number, `Hello ${site.name}, I would like to order:\n${product.name}\nProduct ID/SKU: ${product.id}\nPrice: ${formatPrice(product.pricePkr)}\nProduct page: ${page}\nPlease confirm current stock, delivery charges, payment details and instructions, and the order before I proceed. This is an enquiry, not a confirmed or paid order.`);
}
