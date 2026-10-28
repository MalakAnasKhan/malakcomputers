import { site } from "@/lib/site";
import { generalEnquiryUrl } from "@/lib/whatsapp";
import { Icon } from "@/components/ui/icon";

/** Both approved contacts share the same safe, encoded general enquiry flow. */
export function WhatsAppContacts({ compact = false }: { compact?: boolean }) {
  return <ul aria-label="WhatsApp contact numbers" className={compact ? "flex flex-col gap-1" : "grid gap-3"}>
    {site.whatsappContacts.map(contact => <li key={contact.number}>
      <a href={generalEnquiryUrl(contact.number)!} target="_blank" rel="noopener noreferrer"
        aria-label={`Chat on ${contact.label}: ${contact.display} (opens in a new tab)`}
        className={compact ? "group inline-flex min-h-11 items-center gap-3 text-white underline underline-offset-4" : "group flex min-h-14 items-center gap-3 rounded-xl border border-neutral-200 bg-background px-4 py-3 transition-colors hover:border-neutral-400"}>
        <Icon name="chat" width="18" height="18" className={compact ? "shrink-0 text-lime" : "shrink-0 text-neutral-500"} />
        <span className="flex flex-col gap-1"><span className={compact ? "text-[9px] font-medium tracking-wide text-neutral-400 no-underline" : "text-[9px] font-medium uppercase tracking-wider text-neutral-500"}>{contact.label}</span><span className="text-xs font-medium tabular-nums">{contact.display}</span></span>
        {!compact && <Icon name="arrow-up" width="16" height="16" className="ml-auto shrink-0 text-neutral-500 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />}
      </a>
    </li>)}
  </ul>;
}
