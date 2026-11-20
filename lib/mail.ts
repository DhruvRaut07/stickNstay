import "server-only";
import nodemailer from "nodemailer";

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

function customerText(o: OrderMail): string {
  return [
    `Hi ${o.name},`,
    "",
    `Thanks for ordering from StickNstay! Your order code is ${o.code}.`,
    `${o.qty} x ${o.variant} magnet - Rs ${o.total}, pay cash on delivery.`,
    ...itemLines(o),
    "",
    "We'll contact you on your mobile number to arrange the handover.",
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
    await nodemailer.createTransport({ service: "gmail", auth: { user, pass } }).sendMail({
      from: `StickNstay <${user}>`,
      to,
      subject: `Your StickNstay login code: ${code}`,
      text: `Your StickNstay login code is ${code}.\n\nIt expires in 10 minutes. If you didn't ask for it, you can ignore this email.`,
    });
    return true;
  } catch (error) {
    console.error("Login code mail failed", error);
    return false;
  }
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
    ...(o.email
      ? [
          transport.sendMail({
            from,
            to: o.email,
            subject: `Your StickNstay order ${o.code}`,
            text: customerText(o),
          }),
        ]
      : []),
  ];
  const results = await Promise.allSettled(jobs);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("Order mail failed", r.reason);
  });
}
