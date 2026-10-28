import { PageContainer } from "@/components/layout/page-container";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "./section-heading";

const steps = [
  { number: "01", icon: "search" as const, title: "Explore Products", text: "Browse our computer hardware and accessories." },
  { number: "02", icon: "chat" as const, title: "Contact on WhatsApp", text: "Ask about price, availability and compatibility." },
  { number: "03", icon: "check" as const, title: "Confirm Your Order", text: "Agree on payment, shipping charges and delivery arrangements directly with our team." },
  { number: "04", icon: "box" as const, title: "Receive Your Product", text: "We arrange dispatch and provide tracking where available." },
];
export function OrderingSteps() {
  return <section id="how-to-order" className="section-space border-t border-neutral-200"><PageContainer><div data-reveal><SectionHeading eyebrow="How to Order" title="From a good idea to your next build." /><p className="max-w-xl text-sm leading-7 text-neutral-600">No complicated checkout. Just the right details and a direct conversation.</p></div><div className="order-grid">{steps.map(step => <div className="order-step" key={step.number} data-reveal><div className="order-step-top"><span className="eyebrow">{step.number}</span><span className="step-icon"><Icon name={step.icon} /></span></div><h3>{step.title}</h3><p>{step.text}</p></div>)}</div></PageContainer></section>;
}
