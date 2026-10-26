import { Breadcrumbs } from "./breadcrumbs";

export function PageIntro({ eyebrow, title, description, breadcrumbs }: { eyebrow: string; title: string; description: string; breadcrumbs: readonly { label: string; href?: string }[] }) {
  return <div className="pb-10 pt-7 sm:pb-14 sm:pt-10"><Breadcrumbs items={breadcrumbs} /><p className="eyebrow">{eyebrow}</p><h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-7xl">{title}</h1><p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">{description}</p></div>;
}
