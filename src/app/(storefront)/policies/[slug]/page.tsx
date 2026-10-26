import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageIntro } from "@/components/storefront/page-intro";
import { policies, getPolicy } from "@/modules/storefront/policies";
import { pageMetadata } from "@/modules/storefront/seo";
import { Icon } from "@/components/ui/icon";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return policies.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props) {
  const policy = getPolicy((await params).slug);
  return policy ? pageMetadata(policy.title, policy.summary, `/policies/${policy.slug}`, true) : { title: "Information not found" };
}
export default async function PolicyPage({ params }: Props) {
  const policy = getPolicy((await params).slug);
  if (!policy) notFound();
  return <PageContainer className="pb-16 sm:pb-24"><PageIntro eyebrow="Store information" title={policy.title} description={policy.summary} breadcrumbs={[{ label: policy.title }]} /><div className="grid gap-10 border-t border-neutral-200 pt-10 lg:grid-cols-[220px_1fr] lg:gap-16"><nav aria-label="Store information" className="policy-navigation flex flex-wrap gap-x-6 gap-y-2 self-start lg:flex-col">{policies.map((item) => <Link key={item.slug} href={`/policies/${item.slug}`} aria-current={policy.slug === item.slug ? "page" : undefined} className={`py-3 text-xs ${policy.slug === item.slug ? "font-semibold text-neutral-950" : "text-neutral-500 hover:text-neutral-950"}`}>{item.title}</Link>)}</nav><article className="policy-article max-w-2xl"><div className="policy-draft text-xs leading-7"><strong className="mb-1 block text-neutral-950">Draft — awaiting business approval.</strong>This page identifies the information still to be confirmed. It is not a published final policy or a promise of particular business terms.</div><p className="mt-8 text-sm leading-8 text-neutral-600">{policy.introduction}</p>{policy.sections.map((section) => <section key={section.title} className="mt-10"><h2 className="text-lg font-semibold tracking-tight">{section.title}</h2><p className="mt-4 text-xs leading-8 text-neutral-600">{section.text}</p></section>)}<Link href="/contact" className="text-link mt-10">Contact Malak Computers<Icon name="arrow-up" /></Link></article></div></PageContainer>;
}
