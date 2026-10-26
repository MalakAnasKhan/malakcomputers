import Image from "next/image";
import Link from "next/link";
import { categoryDetails } from "@/modules/catalog/categories";
import { Icon } from "@/components/ui/icon";

export function CategoryGrid() {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{categoryDetails.map((category) => <Link key={category.slug} href={`/categories/${category.slug}`} className="group border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-500 sm:p-6"><div className="flex items-center justify-between"><span className="eyebrow">{category.number}</span><Icon name="arrow-up" className="transition-transform motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:translate-x-1" /></div><div className="relative my-2 aspect-[4/3]"><Image src={category.image} alt={`${category.name} category illustration`} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw" className="object-contain p-2 transition-transform motion-safe:group-hover:scale-105" /></div><h3 className="text-base font-semibold tracking-tight">{category.name}</h3><p className="mt-2 text-xs leading-6 text-neutral-500">{category.description}</p><p className="mt-4 text-[9px] uppercase tracking-widest text-neutral-500">Illustration</p></Link>)}</div>;
}
