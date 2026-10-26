import { PageContainer } from "@/components/layout/page-container";
import { ContactCta } from "./contact-cta";

export function FinalCta() {
  return <section className="final-cta dark-surface" data-reveal><PageContainer><div className="final-cta-inner"><div><p className="eyebrow">A good build starts with a conversation</p><h2>Let’s talk about<br /><span>your next build.</span></h2><p>Have a question or a component in mind? Bring your ideas. We’ll discuss the details together.</p></div><ContactCta compact /></div></PageContainer></section>;
}
