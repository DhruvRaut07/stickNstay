import "server-only";
import nodemailer from "nodemailer";
import { loginCodeEmail, orderConfirmationEmail, welcomeEmail } from "./email-templates";
import { getPrices } from "./settings";

/** Public address used for links and images inside emails: SITE_URL, else the Vercel production domain. */
export function siteUrl(): string {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
}

export type OrderMail = {
  code: string;
  name: string;
  bsp: string;
  mobile: string;
  email?: string;
  variant: "basic" | "custom";
  qty: number;
  total: number;
  note?: string;
  /** Per-design lines for cart orders. */
  items?: readonly { name: string; qty: number }[];
};

const itemLines = (o: OrderMail): string[] =>
  (o.items ?? []).map((item) => `         ${item.qty} x ${item.name}`);

// Plain-text only: user-supplied fields are never interpreted as HTML.
function adminText(o: OrderMail): string {
  return [
    `New StickNstay order ${o.code}`,
    "",
    `Name:    ${o.name}`,
    `BSP:     ${o.bsp}`,
    `Mobile:  ${o.mobile}`,
    `Email:   ${o.email ?? "-"}`,
    `Item:    ${o.qty} x ${o.variant} (5x7 in)`,
    ...itemLines(o),
    `Total:   Rs ${o.total} (cash on delivery)`,
    `Note:    ${o.note ?? "-"}`,
    o.variant === "custom" ? "Image:   open the admin dashboard to download it" : "",
  ].join("\n");
}

/** Emails a login code. Returns false if it could not be sent. In dev without mail config, logs the code instead. */
export async function sendLoginCode(to: string, code: string): Promise<boolean> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    if (process.env.NODE_ENV === "production") {
      console.error("Mail not configured (GMAIL_USER, GMAIL_APP_PASSWORD)");
      return false;
    }
    console.info(`[dev] StickNstay login code for ${to}: ${code}`);
    return true;
  }
  try {
    const mail = loginCodeEmail(code, siteUrl());
    await nodemailer.createTransport({ service: "gmail", auth: { user, pass } }).sendMail({
      from: `stickNstay <${user}>`,
      to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    return true;
  } catch (error) {
    console.error("Login code mail failed", error);
    return false;
  }
}

/** Sent once, on a student's first login, whether or not they ever order. Never throws. */
export async function sendWelcomeMail(to: string, name: string): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    if (process.env.NODE_ENV === "production") console.error("Mail not configured, welcome email skipped");
    else console.info(`[dev] welcome email for ${to} skipped (mail not configured)`);
    return;
  }
  try {
    const mail = welcomeEmail(name, await getPrices(), siteUrl());
    await nodemailer.createTransport({ service: "gmail", auth: { user, pass } }).sendMail({
      from: `stickNstay <${user}>`,
      to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
  } catch (error) {
    console.error("Welcome mail failed", error);
  }
}

function customerMail(transport: ReturnType<typeof nodemailer.createTransport>, from: string, to: string, o: OrderMail) {
  const mail = orderConfirmationEmail(o, siteUrl());
  return transport.sendMail({ from, to, subject: mail.subject, text: mail.text, html: mail.html });
}

/** Never throws: a mail failure must not fail an order that is already saved. */
export async function sendOrderMails(o: OrderMail): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const adminTo = process.env.ADMIN_NOTIFY_EMAIL;
  if (!user || !pass || !adminTo) {
    console.error("Mail not configured (GMAIL_USER, GMAIL_APP_PASSWORD, ADMIN_NOTIFY_EMAIL)");
    return;
  }
  const transport = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  const from = `StickNstay <${user}>`;

  const jobs = [
    transport.sendMail({ from, to: adminTo, subject: `New order ${o.code}`, text: adminText(o) }),
    ...(o.email ? [customerMail(transport, from, o.email, o)] : []),
  ];
  const results = await Promise.allSettled(jobs);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("Order mail failed", r.reason);
  });
}
