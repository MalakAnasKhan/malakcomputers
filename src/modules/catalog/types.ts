export const categories = ["Graphics cards", "Processors", "Memory", "Storage"] as const;
export type Category = (typeof categories)[number];
export type StockStatus = "in-stock" | "out-of-stock" | "on-request" | "unconfirmed";

export type Product = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly brand: string;
  readonly category: Category | null;
  /** Whole Pakistani rupees; null means no approved price. */
  readonly pricePkr: number | null;
  readonly images: readonly [{ readonly src: string; readonly alt: string }, ...{ readonly src: string; readonly alt: string }[]];
  readonly description: string;
  readonly specifications: readonly { readonly name: string; readonly value: string }[];
  readonly stockStatus: StockStatus;
  readonly featured: boolean;
  /** Samples are always excluded from WhatsApp ordering. */
  readonly isSample: boolean;
};
