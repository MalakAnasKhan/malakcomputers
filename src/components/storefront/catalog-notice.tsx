import { site } from "@/lib/site";
import { products } from "@/modules/catalog/products";

export function CatalogNotice() {
  if (!site.preview && !products.some(product => product.isSample)) return null;
  return <div className="catalog-notice"><span className="badge">Preview</span><p><strong className="font-semibold text-graphite">Sample catalog.</strong> Listings marked Sample are not offered for sale. Product photographs, prices and availability are awaiting approval.</p></div>;
}
