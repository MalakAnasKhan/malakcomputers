import Link from "next/link";
import { generalEnquiryUrl } from "@/lib/whatsapp";
import { Icon } from "@/components/ui/icon";

export function ContactCta({ compact = false }: { compact?: boolean }) {
  const url = generalEnquiryUrl();
  return <div><div className="flex flex-wrap items-center gap-4">{url ? <a className="button" href={url} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp (opens in a new tab)">Chat on WhatsApp<Icon name="chat" /></a> : <Link className="button" href="/contact">Contact information<Icon name="arrow-up" /></Link>}{!compact && <Link className="text-link" href="/shop">Browse hardware<Icon name="arrow" /></Link>}</div>{!url && <p className="mt-3 text-[11px] leading-5 text-neutral-500">WhatsApp contact details are awaiting approval.</p>}</div>;
}
