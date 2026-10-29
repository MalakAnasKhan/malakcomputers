type SiteSettings = {
  name: string;
  description: string;
  preview: boolean;
  /** Approved HTTPS storefront origin, e.g. the final public domain. */
  url: string | null;
  whatsappNumber: string | null;
  whatsappContacts: readonly { label: string; number: string; display: string }[];
  contact: { email: string | null; phone: string | null; address: string | null };
  locationUrl: string | null;
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
  contact: { email: null, phone: whatsappContacts[0].display, address: "Office No. 1, 1st Floor, CFC & CoWorx Center Qambar Bypass Near SPS Girls College, Bahrain Road Mingora, Swat, Pakistan" },
  locationUrl: "https://maps.app.goo.gl/ct1vB35o3pFuDHzv6",
  socials: [],
  googleSiteVerification: null,
};

/** Use the business-supplied map link; other addresses remain search queries. */
export function directionsUrl(address: string | null = site.contact.address): string | null {
  if (address === site.contact.address && address?.trim() && site.locationUrl) return site.locationUrl;
  return address?.trim() ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
}
