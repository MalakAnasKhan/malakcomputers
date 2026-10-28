type SiteSettings = {
  name: string;
  description: string;
  preview: boolean;
  /** Approved HTTPS storefront origin, e.g. the final public domain. */
  url: string | null;
  whatsappNumber: string | null;
  contact: { email: string | null; phone: string | null; address: string | null };
  socials: readonly { label: string; url: string }[];
  /** Public ownership token supplied by Search Console; never use a fabricated token. */
  googleSiteVerification: string | null;
};

// Public business information only. Never put credentials in this module.
// Leave unapproved details empty; no placeholder phone number can receive orders.
export const site: SiteSettings = {
  name: "Malak Computers",
  description: "Malak Computers is a Pakistan-based computer hardware business. Explore components and discuss your next build on WhatsApp.",
  preview: false,
  url: "https://malakcomputers.vercel.app",
  whatsappNumber: "923109806478",
  contact: { email: null, phone: "+92 310 9806478", address: "Office # 01, CoWork Floor 1 of CFC Center, Bypass Mingora Swat, Khyber Pakhtunkhwa, Pakistan." },
  socials: [],
  googleSiteVerification: null,
};

/** Address search only: no inferred coordinates or verified map pin. */
export function directionsUrl(address: string | null = site.contact.address): string | null {
  return address?.trim() ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
}
