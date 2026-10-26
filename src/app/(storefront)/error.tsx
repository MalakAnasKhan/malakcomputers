"use client";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export default function StorefrontError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageContainer className="py-20 sm:py-28"><p className="eyebrow">Let’s try that again</p><h1 className="mt-5 text-4xl font-semibold tracking-tight">This page couldn’t load.</h1><p className="mt-5 max-w-md text-sm leading-7 text-neutral-500">Please try again, or return to the shop to keep browsing.</p><div className="mt-8 flex flex-wrap gap-4"><button onClick={reset} className="button">Try again</button><Link href="/shop" className="button button-outline">Back to the shop</Link></div></PageContainer>;
}
