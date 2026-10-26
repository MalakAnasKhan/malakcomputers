export const policies = [
  { slug: "shipping", title: "Shipping & delivery", summary: "Delivery details, confirmed in conversation.",
    introduction: "Delivery options and charges need to be confirmed on WhatsApp before an order proceeds.",
    sections: [
      { title: "Awaiting business approval", text: "Delivery coverage, carriers, dispatch estimates, shipping charges and any collection options have not been approved for publication." },
      { title: "Before placing an order", text: "Ask for the delivery charge and expected delivery arrangements for your location. Do not assume that a listing includes delivery or a guaranteed delivery date." },
    ] },
  { slug: "returns", title: "Returns & warranty", summary: "Know the terms before making a decision.",
    introduction: "A final returns and warranty policy is awaiting business approval. No return window or warranty duration is promised by this draft.",
    sections: [
      { title: "Awaiting business approval", text: "Return eligibility, reporting periods, product condition requirements, warranty coverage, exclusions, handling charges and refund procedures must be approved before publication." },
      { title: "Confirm for your product", text: "Request the applicable return and warranty terms for the exact item on WhatsApp before confirming an order or making payment." },
    ] },
  { slug: "privacy", title: "Privacy", summary: "A clear view of how enquiries work.",
    introduction: "This storefront lets you browse products and open a WhatsApp enquiry. It does not provide account registration or an online payment form.",
    sections: [
      { title: "WhatsApp enquiries", text: "The order button prepares a message with product details. You choose whether to send it in WhatsApp. WhatsApp is a separate service with its own privacy terms." },
      { title: "Awaiting business approval", text: "A final privacy notice needs confirmed business contact details and a review of hosting logs, cookies, data retention, third-party processing and how privacy requests will be handled. This draft does not promise that hosting services collect no technical data." },
    ] },
  { slug: "terms", title: "Terms of use", summary: "Product information first. Confirmation by conversation.",
    introduction: "Browsing a product or opening a WhatsApp message does not confirm an order, reserve stock or mark a payment as received.",
    sections: [
      { title: "Sample listings", text: "Listings marked Sample are layout previews. They are not products offered for sale and cannot be ordered through this website." },
      { title: "Awaiting business approval", text: "The final seller identity, pricing terms, order acceptance process, payment conditions, delivery obligations, dispute process and applicable legal terms require business review and approval. This page is not a final trading agreement." },
    ] },
] as const;

export function getPolicy(slug: string) { return policies.find((policy) => policy.slug === slug); }
