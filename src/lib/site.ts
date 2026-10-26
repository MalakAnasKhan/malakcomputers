type SiteSettings = {
  name: string;
  description: string;
  preview: boolean;
  /** Approved HTTPS storefront origin, e.g. the final public domain. */
  url: string | null;
  whatsappNumber: string | null;
  contact: { email: string | null; phone: string | null; address: string | null };
  socials: readonly { label: string; url: string }[];
};

// Public business information only. Never put credentials in this module.
// Leave unapproved details empty; no placeholder phone number can receive orders.
export const site: SiteSettings = {
  name: "MALAK COMPUTERS",
  description: "Malak Computers is a Pakistan-based computer hardware business. Explore components and discuss your next build on WhatsApp.",
  preview: true,
  url: null,
  whatsappNumber: "923109806478",
  contact: { email: null, phone: null, address: null },
  socials: [],
};
