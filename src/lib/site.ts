type SiteSettings = {
  name: string;
  description: string;
  preview: boolean;
  /** Approved HTTPS storefront origin, e.g. the final public domain. */
  url: string | null;
  whatsappNumber: string | null;
  whatsappContacts: readonly { label: string; number: string; display: string }[];
  contact: { email: string | null; phone: string | null; address: string | null };
  socials: readonly { label: string; url: string }[];
  /** Public ownership token supplied by Search Console; never use a fabricated token. */
  googleSiteVerification: string | null;
};

// Public business information only. Never put credentials in this module.
// Leave unapproved details empty; no placeholder phone number can receive orders.
const whatsappContacts = [
  { label: "WhatsApp 1", number: "923109806478", display: "+92 310 9806478" },
  { label: "WhatsApp 2", number: "923229124952", display: "+92 322 9124952" },
] as const;

export const site: SiteSettings = {
  name: "Malak Computers",
  description: "Malak Computers is a Pakistan-based computer hardware business. Explore components and discuss your next build on WhatsApp.",
  preview: false,
  url: "https://malakcomputers.vercel.app",
  whatsappNumber: whatsappContacts[0].number,
  whatsappContacts,
  contact: { email: null, phone: whatsappContacts[0].display, address: "Office # 01, CoWork Floor 1 of CFC Center, Bypass Mingora Swat, Khyber Pakhtunkhwa, Pakistan." },
  socials: [],
  googleSiteVerification: null,
};

/** Address search only: no inferred coordinates or verified map pin. */
export function directionsUrl(address: string | null = site.contact.address): string | null {
  return address?.trim() ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
}
