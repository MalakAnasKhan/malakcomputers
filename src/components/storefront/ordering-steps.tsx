import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "./section-heading";
import { ContactCta } from "./contact-cta";

const steps = [
  { number: "01", title: "Find your component.", text: "Explore categories, compare specifications and choose an approved product listing." },
  { number: "02", title: "Start a conversation.", text: "Use Order on WhatsApp to prepare a message with the product, price and page link. You decide when to send it." },
  { number: "03", title: "Confirm the details.", text: "Confirm stock, delivery charges, payment details and the order directly on WhatsApp. Nothing is marked paid or confirmed automatically." },
];
export function OrderingSteps() {
  return <section id="how-to-order" className="section-space border-t border-neutral-200"><PageContainer><SectionHeading eyebrow="A more personal way to order" title="From your shortlist to WhatsApp." /><div className="mb-10 grid gap-8 md:grid-cols-3">{steps.map((step) => <div key={step.number} className="border-t border-neutral-300 pt-6"><span className="text-4xl font-medium tracking-tight text-neutral-300">{step.number}</span><h3 className="mb-3 mt-7 text-lg font-semibold tracking-tight">{step.title}</h3><p className="max-w-sm text-xs leading-7 text-neutral-500">{step.text}</p></div>)}</div><ContactCta /></PageContainer></section>;
}
