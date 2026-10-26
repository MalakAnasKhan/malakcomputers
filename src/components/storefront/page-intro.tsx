import { Breadcrumbs } from "./breadcrumbs";

export function PageIntro({ eyebrow, title, description, breadcrumbs }: { eyebrow: string; title: string; description: string; breadcrumbs: readonly { label: string; href?: string }[] }) {
  return <div className="page-intro"><Breadcrumbs items={breadcrumbs} /><div className="page-intro-panel"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div><p className="page-intro-description">{description}</p></div></div>;
}
