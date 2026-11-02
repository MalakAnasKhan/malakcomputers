export const categories = [
  "Graphics cards",
  "Processors",
  "Motherboards",
  "Memory",
  "Storage",
  "Power supplies",
  "Cases",
  "Cooling",
  "Pre-builts",
] as const;

export type Category = (typeof categories)[number];
export type StockStatus = "in-stock" | "out-of-stock" | "on-request" | "unconfirmed";

export const conditions = ["Used", "Refurbished", "Box Pack"] as const;
export type Condition = (typeof conditions)[number];

export type Product = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly brand: string;
  readonly category: Category | null;
  /** Whole Pakistani rupees; null means no approved price. */
  readonly pricePkr: number | null;
  readonly condition?: Condition;
  readonly images: readonly [{ readonly src: string; readonly alt: string }, ...{ readonly src: string; readonly alt: string }[]];
  readonly description: string;
  readonly specifications: readonly { readonly name: string; readonly value: string }[];
  readonly stockStatus: StockStatus;
  readonly featured: boolean;
  /** Samples are always excluded from WhatsApp ordering. */
  readonly isSample: boolean;
  /** Set only after product-specific approval; omitted means eligibility unknown. */
  readonly checkingWarrantyEligible?: boolean;
  /** Explicit false removes the listing from all public discovery and detail routes. */
  readonly published?: boolean;
};
