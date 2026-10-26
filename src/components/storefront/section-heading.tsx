import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export function SectionHeading({ eyebrow, title, href, linkLabel = "Explore", id }: { eyebrow: string; title: string; href?: string; linkLabel?: string; id?: string }) {
  return <div className="mb-8 flex flex-wrap items-end justify-between gap-6 sm:mb-10"><div><p className="eyebrow">{eyebrow}</p><h2 id={id} className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl lg:text-5xl">{title}</h2></div>{href && <Link href={href} className="text-link">{linkLabel}<Icon name="arrow" /></Link>}</div>;
}
