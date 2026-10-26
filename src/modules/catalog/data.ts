import type { Product } from "./types";

// Layout samples only: no real products, prices, specifications or stock claims.
// Replace with owner-approved catalog data before announcing the store.
export const catalogData: readonly Product[] = [
  { id: "sample-gpu", slug: "sample-graphics-card", name: "Sample graphics card", brand: "Not specified", category: "Graphics cards", pricePkr: null,
    images: [{ src: "/images/catalog/sample-gpu.svg", alt: "Sample graphics card illustration; not a product photograph" }],
    description: "A preview of how graphics cards will appear in the catalog. The actual model, images and specifications are awaiting approval.",
    specifications: [{ name: "Model", value: "Awaiting approved catalog data" }], stockStatus: "unconfirmed", featured: true, isSample: true },
  { id: "sample-cpu", slug: "sample-processor", name: "Sample processor", brand: "Not specified", category: "Processors", pricePkr: null,
    images: [{ src: "/images/catalog/sample-cpu.svg", alt: "Sample processor illustration; not a product photograph" }],
    description: "A preview of how processors will appear in the catalog. The actual model, images and specifications are awaiting approval.",
    specifications: [{ name: "Model", value: "Awaiting approved catalog data" }], stockStatus: "unconfirmed", featured: true, isSample: true },
  { id: "sample-memory", slug: "sample-memory", name: "Sample memory kit", brand: "Not specified", category: "Memory", pricePkr: null,
    images: [{ src: "/images/catalog/sample-memory.svg", alt: "Sample memory illustration; not a product photograph" }],
    description: "A preview of how memory kits will appear in the catalog. The actual model, images and specifications are awaiting approval.",
    specifications: [{ name: "Model", value: "Awaiting approved catalog data" }], stockStatus: "unconfirmed", featured: false, isSample: true },
  { id: "sample-storage", slug: "sample-storage", name: "Sample storage drive", brand: "Not specified", category: "Storage", pricePkr: null,
    images: [{ src: "/images/catalog/sample-storage.svg", alt: "Sample storage illustration; not a product photograph" }],
    description: "A preview of how storage drives will appear in the catalog. The actual model, images and specifications are awaiting approval.",
    specifications: [{ name: "Model", value: "Awaiting approved catalog data" }], stockStatus: "unconfirmed", featured: false, isSample: true },
];
