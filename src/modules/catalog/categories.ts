import type { Category } from "./types";

export const categoryDetails: readonly { name: Category; slug: string; description: string; image: string; number: string }[] = [
  { name: "Graphics cards", slug: "graphics-cards", description: "For the frames, the renders, and everything in between.", image: "/images/catalog/sample-gpu.svg", number: "01" },
  { name: "Processors", slug: "processors", description: "The starting point for a carefully considered system.", image: "/images/catalog/sample-cpu.svg", number: "02" },
  { name: "Memory", slug: "memory", description: "Make room for the way you work and play.", image: "/images/catalog/sample-memory.svg", number: "03" },
  { name: "Storage", slug: "storage", description: "Space for your projects, games, and next ideas.", image: "/images/catalog/sample-storage.svg", number: "04" },
];

export function getCategory(slug: string) {
  return categoryDetails.find((category) => category.slug === slug);
}

export function categoryHref(name: Category): string {
  return `/categories/${categoryDetails.find((category) => category.name === name)!.slug}`;
}
