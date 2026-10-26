import { PageContainer } from "@/components/layout/page-container";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "./section-heading";

const steps = [
  { number: "01", icon: "search" as const, title: "Find your starting point.", text: "Browse categories and compare the components you have in mind." },
  { number: "02", icon: "box" as const, title: "Make your shortlist.", text: "Open an approved product listing and check its details and specifications." },
  { number: "03", icon: "chat" as const, title: "Let’s talk hardware.", text: "Use WhatsApp to prepare your product enquiry. You choose when to send it." },
  { number: "04", icon: "check" as const, title: "Confirm it personally.", text: "Confirm stock, delivery, payment and the order directly. Nothing is automatically paid or confirmed." },
];
export function OrderingSteps() {
  return <section id="how-to-order" className="section-space border-t border-neutral-200"><PageContainer><div data-reveal><SectionHeading eyebrow="Online browsing. A personal conversation." title="From a good idea to your next build." /><p className="max-w-xl text-sm leading-7 text-neutral-600">No complicated checkout. Just the right details and a direct conversation.</p></div><div className="order-grid">{steps.map(step => <div className="order-step" key={step.number} data-reveal><div className="order-step-top"><span className="eyebrow">{step.number}</span><span className="step-icon"><Icon name={step.icon} /></span></div><h3>{step.title}</h3><p>{step.text}</p></div>)}</div></PageContainer></section>;
}
