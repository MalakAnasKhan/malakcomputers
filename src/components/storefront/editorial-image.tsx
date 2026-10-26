import Image from "next/image";
import { editorial } from "@/modules/storefront/editorial";

export function EditorialImage({ kind, priority = false, className = "" }: { kind: "hero" | "story"; priority?: boolean; className?: string }) {
  const asset = editorial[kind];
  return <figure className={`editorial-image editorial-${kind} ${className}`}>
    <div className="editorial-image-frame"><Image src={asset.src} alt={asset.alt} fill priority={priority} sizes={kind === "hero" ? "(max-width: 1023px) 100vw, 58vw" : "(max-width: 767px) 100vw, 50vw"} className="object-cover" data-parallax={!priority ? "" : undefined} /></div>
    <figcaption>{editorial.caption}</figcaption>
  </figure>;
}
