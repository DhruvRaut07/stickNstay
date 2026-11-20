import { DAILY_LIMIT, type Prices } from "./rules";

/** Branded HTML + plain-text emails. Pure functions (no I/O), so they are easy to test and preview. */

export type Email = { subject: string; html: string; text: string };

export type OrderSummary = {
  code: string;
  name: string;
  variant: "basic" | "custom";
  qty: number;
  total: number;
  note?: string;
  items?: readonly { name: string; qty: number }[];
};

const C = {
  sun: "#FFD45C",
  ink: "#1B1B2F",
  red: "#E63946",
  redDeep: "#C9283A",
  cream: "#FFF6E9",
  paper: "#F4EFE6",
  line: "#D9D2C3",
  soft: "#5A6275",
  white: "#FFFFFF",
} as const;

// Fredoka loads where the client allows web fonts; the rest fall back to a rounded system font.
const FONT = "'Fredoka','Trebuchet MS','Segoe UI',Arial,sans-serif";

export const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** "DHRUV RAUT" -> "Dhruv". */
export const firstName = (name: string): string => {
  const word = name.trim().split(/\s+/)[0] ?? "";
  return word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : "there";
};

const text = (size: number, color: string, weight = 400, extra = "") =>
  `font-family:${FONT};font-size:${size}px;line-height:1.5;color:${color};font-weight:${weight};${extra}`;

const img = (site: string, file: string, width: number, alt: string) =>
  `<img src="${site}/email/${file}" width="${width}" alt="${esc(alt)}" style="display:block;border:0;height:auto;width:${width}px;max-width:100%">`;

function button(href: string, label: string, kind: "ink" | "sun" = "ink"): string {
  const [bg, fg, shadow] = kind === "ink" ? [C.ink, C.sun, "#000000"] : [C.sun, C.ink, "#C9A23A"];
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto"><tr>
<td align="center" bgcolor="${bg}" style="border-radius:999px;background:${bg};box-shadow:0 5px 0 ${shadow}">
<a href="${href}" style="display:inline-block;padding:16px 36px;border-radius:999px;${text(18, fg, 700, "text-decoration:none")}">${label}</a>
</td></tr></table>`;
}

function stickerRow(site: string, slugs: readonly string[]): string {
  const cells = slugs
    .map((s) => `<td align="center" valign="middle" style="padding:6px">${img(site, `sticker-${s}.png`, 150, "")}</td>`)
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>`;
}

function step(n: number, title: string, body: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px"><tr>
<td width="56" valign="top"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td width="40" height="40" align="center" valign="middle" bgcolor="${C.ink}" style="border-radius:20px;background:${C.ink};${text(20, C.sun, 700)}">${n}</td>
</tr></table></td>
<td valign="top"><div style="${text(18, C.ink, 700)}">${esc(title)}</div><div style="${text(15, C.soft)}">${esc(body)}</div></td>
</tr></table>`;
}

const pill = (label: string) =>
  `<span style="display:inline-block;padding:7px 16px;border-radius:999px;background:${C.ink};${text(12, C.sun, 700, "letter-spacing:2px")}">${esc(label)}</span>`;

const card = (inner: string, extra = "") =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.white};border:2px solid ${C.ink};border-radius:24px;${extra}"><tr><td style="padding:24px">${inner}</td></tr></table>`;

function layout(o: { title: string; preheader: string; site: string; body: string }): string {
  const { site } = o;
  const links = [["Shop", "/shop"], ["About", "/about"], ["FAQ", "/faq"], ["Contact", "/contact"]]
    .map(([label, path]) => `<a href="${site}${path}" style="${text(14, C.sun, 600, "text-decoration:none")}">${label}</a>`)
    .join(`<span style="color:${C.soft}"> &nbsp;·&nbsp; </span>`);

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${esc(o.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<style>@media (max-width:620px){.wrap{width:100%!important}.pad{padding-left:22px!important;padding-right:22px!important}.h1{font-size:32px!important}}</style>
</head>
<body style="margin:0;padding:0;background:${C.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(o.preheader)}${"&nbsp;&zwnj;".repeat(60)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.paper}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px">
<tr><td align="center" bgcolor="${C.sun}" style="background:${C.sun};border-radius:28px 28px 0 0;padding:30px 24px 26px">
<a href="${site}" style="text-decoration:none">${img(site, "logo-on-yellow.png", 200, "stickNstay")}</a></td></tr>
<tr><td align="center" bgcolor="${C.ink}" style="background:${C.ink};padding:11px 12px;${text(14, C.cream, 600, "letter-spacing:1px")}">custom magnets for your space &nbsp;✦&nbsp; stick it &nbsp;✦&nbsp; stay cute</td></tr>
<tr><td class="pad" bgcolor="${C.cream}" style="background:${C.cream};padding:36px 36px 28px">${o.body}</td></tr>
<tr><td align="center" bgcolor="${C.ink}" style="background:${C.ink};border-radius:0 0 28px 28px;padding:30px 24px">
${img(site, "logo-on-dark.png", 150, "stickNstay")}
<div style="${text(15, C.cream, 400, "margin:14px 0 4px")}">Magnet stickers that make your corner look like you.</div>
<div style="margin:14px 0">${links}</div>
<div style="${text(12, "#9AA0B4")}">stickNstay · A marketing project at IBS Mumbai</div>
</td></tr></table></td></tr></table></body></html>`;
}

/* ---------- Order confirmation ---------- */

function orderLines(o: OrderSummary): string {
  const lines = o.items?.length
    ? o.items.map((i) => [i.name, i.qty] as const)
    : [[o.variant === "custom" ? "Custom photo magnet" : "Magnet", o.qty] as const];
  return lines
    .map(
      ([name, qty]) => `<tr><td style="padding:7px 0;${text(16, C.ink, 600)}">${esc(name)}</td>
<td align="right" style="padding:7px 0;${text(16, C.soft, 600)}">× ${qty}</td></tr>`,
    )
    .join("");
}

export function orderConfirmationEmail(o: OrderSummary, site: string): Email {
  const first = firstName(o.name);
  const custom = o.variant === "custom" && !o.items?.length;

  const body = `
<div align="center">${pill("ORDER CONFIRMED")}</div>
<h1 class="h1" style="margin:16px 0 8px;text-align:center;${text(40, C.ink, 700, "line-height:1.1")}">You're in, ${esc(first)}!</h1>
<p style="margin:0 0 26px;text-align:center;${text(17, C.soft)}">Your magnets are being lined up. Here's everything in one place.</p>

<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 8px"><tr>
<td align="center" bgcolor="${C.ink}" style="background:${C.ink};border-radius:22px;padding:18px 34px">
<div style="${text(11, C.sun, 700, "letter-spacing:3px")}">YOUR ORDER CODE</div>
<div style="${text(34, C.sun, 700, "letter-spacing:4px;line-height:1.2")}">${esc(o.code)}</div>
</td></tr></table>
<p style="margin:0 0 26px;text-align:center;${text(14, C.soft)}">Keep it handy. You'll need it at delivery.</p>

${card(`<div style="${text(13, C.soft, 700, "letter-spacing:2px;margin:0 0 8px")}">YOUR ORDER</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${orderLines(o)}
<tr><td colspan="2" style="padding:8px 0 0"><div style="border-top:2px dashed ${C.line};font-size:0;line-height:0">&nbsp;</div></td></tr>
<tr><td style="padding:12px 0 0;${text(16, C.ink, 700)}">To pay on delivery</td>
<td align="right" style="padding:12px 0 0;${text(30, C.redDeep, 700)}">₹${o.total}</td></tr></table>
${custom ? `<p style="margin:14px 0 0;${text(14, C.soft)}">We'll print your photo exactly as you sent it.</p>` : ""}
${o.note ? `<p style="margin:14px 0 0;${text(14, C.soft)}">Your note: “${esc(o.note)}”</p>` : ""}`)}

<h2 style="margin:34px 0 16px;${text(24, C.ink, 700)}">What happens next</h2>
${step(1, "We get in touch", "We'll contact you on the mobile number you gave to plan the handover.")}
${step(2, "You collect it", "Meet us on campus, pick up your magnets and give them a good look.")}
${step(3, "You pay cash", "Pay on delivery. There is no online payment, ever.")}

<h2 style="margin:30px 0 6px;text-align:center;${text(24, C.ink, 700)}">While you wait</h2>
<p style="margin:0 0 12px;text-align:center;${text(15, C.soft)}">A few more ways to make your space look like you.</p>
${stickerRow(site, ["snacks-first", "dream-big-start-small", "glow-from-within"])}
<div style="height:14px;line-height:14px">&nbsp;</div>
${button(`${site}/shop`, "Browse more designs")}
<p style="margin:26px 0 0;text-align:center;${text(14, C.soft)}">Something wrong with your order? Just reply to this email with your code.</p>`;

  const lines = (o.items?.length ? o.items.map((i) => `  ${i.qty} x ${i.name}`) : [`  ${o.qty} x ${o.variant} magnet`]).join("\n");
  return {
    subject: `You're in! Order ${o.code} is confirmed`,
    html: layout({ title: `Order ${o.code}`, preheader: `Order ${o.code} confirmed. Pay ₹${o.total} cash when it arrives.`, site, body }),
    text: [
      `Hi ${first},`,
      "",
      `You're in! Your order code is ${o.code}. Keep it handy, you'll need it at delivery.`,
      "",
      lines,
      `To pay on delivery: Rs ${o.total}`,
      "",
      "What happens next:",
      "1. We contact you on your mobile number to plan the handover.",
      "2. You collect your magnets on campus.",
      "3. You pay cash on delivery.",
      "",
      `More designs: ${site}/shop`,
      "",
      "stickNstay · A marketing project at IBS Mumbai",
    ].join("\n"),
  };
}

/* ---------- Login code ---------- */

export function loginCodeEmail(code: string, site: string): Email {
  const body = `
<div align="center">${pill("LOGIN CODE")}</div>
<h1 class="h1" style="margin:16px 0 8px;text-align:center;${text(38, C.ink, 700, "line-height:1.1")}">Here's your code.</h1>
<p style="margin:0 0 24px;text-align:center;${text(17, C.soft)}">Type it on the login page. It works for the next 10 minutes.</p>
<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 24px"><tr>
<td align="center" bgcolor="${C.ink}" style="background:${C.ink};border-radius:22px;padding:20px 38px">
<div style="${text(46, C.sun, 700, "letter-spacing:10px;line-height:1.2")}">${esc(code)}</div></td></tr></table>
<div align="center">${img(site, "sticker-overthinking-brb.png", 190, "Overthinking, be right back")}</div>
<p style="margin:14px 0 0;text-align:center;${text(14, C.soft)}">Didn't ask for this? You can ignore it. Nobody can log in without the code.</p>`;

  return {
    subject: `${code} is your stickNstay login code`,
    html: layout({ title: "Your login code", preheader: `Your stickNstay login code is ${code}. It expires in 10 minutes.`, site, body }),
    text: `Your stickNstay login code is ${code}.\n\nIt expires in 10 minutes. If you didn't ask for it, you can ignore this email.\n\nstickNstay · A marketing project at IBS Mumbai`,
  };
}

/* ---------- Welcome (first login) ---------- */

export function welcomeEmail(name: string, prices: Prices, site: string): Email {
  const first = firstName(name);
  const plan = (title: string, price: number, blurb: string, bg: string) =>
    `<td width="50%" valign="top" style="padding:6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border:2px solid ${C.ink};border-radius:22px"><tr><td style="padding:20px" align="center">
<div style="${text(20, C.ink, 700)}">${esc(title)}</div><div style="${text(38, C.ink, 700, "line-height:1.2")}">₹${price}</div>
<div style="${text(14, C.ink)}">${esc(blurb)}</div></td></tr></table></td>`;

  const body = `
<div align="center">${pill("WELCOME")}</div>
<h1 class="h1" style="margin:16px 0 8px;text-align:center;${text(40, C.ink, 700, "line-height:1.1")}">Hey ${esc(first)}, you're in!</h1>
<p style="margin:0 0 24px;text-align:center;${text(17, C.soft)}">You're verified as an IBS Mumbai student. Time to make your space look like you.</p>
${stickerRow(site, ["snacks-first", "dream-big-start-small", "glow-from-within"])}
${stickerRow(site, ["overthinking-brb", "focus-mode-on", "chai-over-everything"])}

<h2 style="margin:30px 0 10px;text-align:center;${text(24, C.ink, 700)}">Two ways to stick</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
${plan("Basic", prices.basic, "Ready-made designs", C.white)}${plan("Custom", prices.custom, "Your own photo", C.sun)}
</tr></table>
<p style="margin:12px 0 26px;text-align:center;${text(14, C.soft)}">5×7 inch magnets · cash on delivery · up to ${DAILY_LIMIT} per day</p>

${step(1, "Pick a design", "Browse stickers for study, gym, vibes and more, or upload your own photo.")}
${step(2, "Place your order", "No payment online. It takes less than a minute.")}
${step(3, "Collect and pay cash", "We'll arrange the handover on campus.")}
<div style="height:10px;line-height:10px">&nbsp;</div>
${button(`${site}/shop`, "Start shopping", "sun")}
<p style="margin:18px 0 0;text-align:center;${text(15, C.soft)}">Got a photo in mind? <a href="${site}/order?variant=custom" style="color:${C.redDeep};font-weight:700">Make a custom one</a></p>`;

  return {
    subject: `Welcome to stickNstay, ${first}!`,
    html: layout({ title: "Welcome to stickNstay", preheader: `You're in, ${first}. Pick your first magnet.`, site, body }),
    text: [
      `Hey ${first}, you're in!`,
      "",
      "You're verified as an IBS Mumbai student. Time to make your space look like you.",
      "",
      `Basic: Rs ${prices.basic} (ready-made designs). Custom: Rs ${prices.custom} (your own photo).`,
      `5x7 inch magnets, cash on delivery, up to ${DAILY_LIMIT} per day.`,
      "",
      `Start shopping: ${site}/shop`,
      `Make a custom one: ${site}/order?variant=custom`,
      "",
      "stickNstay · A marketing project at IBS Mumbai",
    ].join("\n"),
  };
}
