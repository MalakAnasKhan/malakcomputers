import { serializeStructuredData } from "@/modules/storefront/structured-data";

export function JsonLd({ data }: { data: unknown }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }} />;
}
