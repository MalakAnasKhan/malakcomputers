import { site } from "@/lib/site";
import { generalEnquiryUrl } from "@/lib/whatsapp";
import { Icon } from "@/components/ui/icon";

/** Both approved contacts share the same safe, encoded general enquiry flow. */
export function WhatsAppContacts({ compact = false }: { compact?: boolean }) {
  return <ul aria-label="WhatsApp contact numbers" className={compact ? "grid w-full gap-2" : "grid gap-3"}>
    {site.whatsappContacts.map(contact => <li key={contact.number}>
      <a href={generalEnquiryUrl(contact.number)!} target="_blank" rel="noopener noreferrer"
        aria-label={`Chat on ${contact.label}: ${contact.display} (opens in a new tab)`}
        className={compact ? "whatsapp-contact group flex min-h-14 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-white transition-colors hover:border-lime/40 hover:bg-white/[0.06]" : "whatsapp-contact group flex min-h-14 items-center gap-3 rounded-xl border border-neutral-200 bg-background px-4 py-3 transition-colors hover:border-neutral-400"}>
        <span className={compact ? "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lime/10 text-lime" : "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-600"}><Icon name="chat" width="16" height="16" /></span>
        <span className="flex flex-col gap-1"><span className={compact ? "text-[9px] font-medium tracking-wide text-neutral-400" : "text-[9px] font-medium uppercase tracking-wider text-neutral-500"}>{contact.label}</span><span className="text-xs font-medium tabular-nums">{contact.display}</span></span>
        {!compact && <Icon name="arrow-up" width="16" height="16" className="ml-auto shrink-0 text-neutral-500 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />}
      </a>
    </li>)}
  </ul>;
}
