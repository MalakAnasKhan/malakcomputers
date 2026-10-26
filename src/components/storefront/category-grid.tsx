import Image from "next/image";
import Link from "next/link";
import { categoryDetails } from "@/modules/catalog/categories";
import { Icon } from "@/components/ui/icon";

export function CategoryGrid() {
  return <div className="category-grid">{categoryDetails.map(category => <Link key={category.slug} href={"/categories/" + category.slug} className="category-card" data-reveal>
    <div className="category-card-top"><span className="eyebrow">{category.number}</span><span className="round-arrow"><Icon name="arrow-up" width="15" height="15" /></span></div>
    <div className="category-card-image"><Image src={category.image} alt={category.name + " category illustration, not a product photograph"} fill sizes="(max-width: 767px) 50vw, 25vw" className="object-contain" /></div>
    <h3>{category.name}</h3><p>{category.description}</p><span className="category-caption">Category illustration</span>
  </Link>)}</div>;
}
