import Image from "next/image";
import { MotionElement } from "./motion-element";
import { editorial } from "@/modules/storefront/editorial";

export function EditorialImage({ kind, priority = false, className = "" }: { kind: "hero" | "story"; priority?: boolean; className?: string }) {
  const asset = editorial[kind];
  const image = <Image src={asset.src} alt={asset.alt} fill priority={priority} sizes={kind === "hero" ? "(max-width: 1023px) 100vw, 58vw" : "(max-width: 767px) 100vw, 50vw"} className="object-cover" />;
  return <figure className={`editorial-image editorial-${kind} ${className}`}>
    <div className="editorial-image-frame">{priority ? image : <MotionElement motion="parallax" className="absolute inset-0">{image}</MotionElement>}</div>
    <figcaption>{editorial.caption}</figcaption>
  </figure>;
}
