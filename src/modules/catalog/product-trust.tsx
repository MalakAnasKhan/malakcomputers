import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { Product } from "./types";

export function ProductTrust({ product }: { product: Product }) {
  if (product.isSample) return null;
  const eligible = product.checkingWarrantyEligible === true;
  return <aside aria-label="Warranty and delivery information" className="mt-5 space-y-3 rounded-xl border border-neutral-200 bg-background p-4 text-[11px] leading-6">
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-lime text-graphite"><Icon name="check" width="16" height="16" /></span>
      <div><h2 className="font-semibold">{eligible ? "7-Day Checking Warranty" : product.checkingWarrantyEligible === false ? "Warranty information" : "Ask about warranty coverage"}</h2>
        {eligible && <p className="mt-1 text-neutral-600">Eligible products include a 7-day checking warranty from the date of delivery. Warranty does not cover customer-caused physical damage, electrical burning, liquid damage or misuse. Terms and statutory consumer rights apply.</p>}
        {product.checkingWarrantyEligible === false && <p className="mt-1 text-neutral-600">This product is not eligible for the 7-day checking warranty. Statutory consumer rights apply.</p>}
        {!eligible && product.checkingWarrantyEligible !== false && <p className="mt-1 text-neutral-600">Confirm this product&apos;s warranty eligibility and condition with our team before ordering.</p>}
        <Link href="/policies/returns" className="inline-flex min-h-11 items-center underline underline-offset-4">View Warranty Policy</Link>
      </div>
    </div>
    <p className="border-t border-neutral-200 pt-3 text-neutral-600">Nationwide delivery across Pakistan. Shipping is paid by the customer unless separately agreed. <Link href="/policies/shipping" className="underline underline-offset-4">Shipping details</Link></p>
  </aside>;
}
