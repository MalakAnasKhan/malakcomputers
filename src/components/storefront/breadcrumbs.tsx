import Link from "next/link";
import { JsonLd } from "./json-ld";
import { breadcrumbStructuredData } from "@/modules/storefront/structured-data";

export function Breadcrumbs({ items }: { items: readonly { label: string; href?: string }[] }) {
  return <><JsonLd data={breadcrumbStructuredData(items)} /><nav aria-label="Breadcrumb" className="mb-8 text-[11px] text-neutral-500"><ol className="flex flex-wrap items-center gap-x-3 gap-y-2"><li><Link href="/" className="hover:text-neutral-950">Home</Link></li>{items.map((item, index) => <li key={`${item.label}-${index}`} className="flex items-center gap-3"><span aria-hidden="true" className="text-neutral-300">/</span>{item.href ? <Link href={item.href} className="hover:text-neutral-950">{item.label}</Link> : <span aria-current="page" className="text-neutral-950">{item.label}</span>}</li>)}</ol></nav></>;
}
