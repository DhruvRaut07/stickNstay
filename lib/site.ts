/** Site-wide content you may want to edit in one place. */

export const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Demo switch. While true, if the order backend is down or not set up (server/network
 * failure), the form still shows a friendly "Order placed" screen, but NOTHING IS SAVED.
 * Set to false before real launch so customers see real errors instead.
 */
export const DEMO_ORDERS = true;

/**
 * Fill these in and they appear on the Contact page. Empty ones are hidden.
 * instagram: full profile URL · whatsapp: digits with country code (e.g. 919876543210) · email: address
 */
export const CONTACT = {
  instagram: "",
  whatsapp: "",
  email: "",
};

/** Add teammates and they appear on the About page. Empty list hides the section. */
export const TEAM: readonly { name: string; role: string }[] = [];
