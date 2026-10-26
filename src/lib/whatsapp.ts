import { site } from "./site";

/** Accept explicit international numbers only; never guess a country code. */
export function whatsappUrl(number: string | null, message: string): string | null {
  if (number === null || number.trim() === "") return null;
  const digits = number.startsWith("+") ? number.slice(1) : number;
  if (!/^[1-9]\d{7,14}$/.test(digits)) {
    throw new Error("WhatsApp number must contain 8–15 international digits, with an optional leading +.");
  }
  if (!message.trim() || message.length > 2000) {
    throw new Error("WhatsApp message must contain 1–2000 characters.");
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** General questions do not imply a product order or bypass catalog approval. */
export function generalEnquiryUrl(): string | null {
  return whatsappUrl(site.whatsappNumber, `Hello ${site.name}, I have a question about PC hardware. Could you help me?`);
}
