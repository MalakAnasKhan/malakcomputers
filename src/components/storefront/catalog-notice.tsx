import { site } from "@/lib/site";
import { products } from "@/modules/catalog/products";

export function CatalogNotice() {
  if (!site.preview && !products.some((product) => product.isSample)) return null;
  return <div className="flex items-start gap-3 border border-neutral-200 bg-neutral-50 px-4 py-4 text-xs leading-6 sm:px-5"><span className="mt-1 shrink-0 border border-neutral-300 bg-white px-2 text-[9px] font-semibold uppercase tracking-wider">Preview</span><p><strong className="font-semibold text-neutral-950">Sample catalog.</strong> Listings marked Sample are not offered for sale. Product photographs, prices and availability are awaiting approval.</p></div>;
}
