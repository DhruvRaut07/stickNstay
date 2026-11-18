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
};

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
    "",
    "We'll contact you on your mobile number to arrange the handover.",
  ].join("\n");
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
