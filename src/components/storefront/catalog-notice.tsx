import { site } from "@/lib/site";
import { products } from "@/modules/catalog/products";

export function CatalogNotice() {
  if (!site.preview && !products.some(product => product.isSample)) return null;
  return <div className="catalog-notice"><span className="badge">Preview</span><p><strong className="font-semibold text-graphite">Catalog preview.</strong> Listings marked Sample are not offered for sale. Product photographs do not confirm stock. Unverified prices and availability must be confirmed on WhatsApp.</p></div>;
}
