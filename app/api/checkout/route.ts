import { after, NextResponse, type NextRequest } from "next/server";
import { checkoutSchema } from "@/lib/cart";
import { getProductsBySlugs } from "@/lib/catalog";
import { sendOrderMails } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";
import { DAILY_LIMIT } from "@/lib/rules";
import { getStudent } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

const TEN_MINUTES = 10 * 60_000;
const ONE_HOUR = 60 * 60_000;
const MAX_BODY_BYTES = 10_000;

const fail = (status: number, error: string, field?: string) =>
  NextResponse.json({ error, field }, { status });

export async function POST(req: NextRequest) {
  // CSRF: only accept same-origin posts.
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return fail(403, "Forbidden.");

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`ip:${ip}`, 10, TEN_MINUTES)) {
    return fail(429, "Too many attempts. Please wait a few minutes and try again.");
  }
  const student = await getStudent();
  if (!student) return fail(401, "Please log in to place an order.");
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return fail(413, "Request is too large.");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Invalid request.");
  }

  // The BSP comes from the signed login session, never from the request body.
  const parsed = checkoutSchema.safeParse({
    ...(typeof body === "object" && body !== null ? body : {}),
    bsp: student.bsp,
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(400, issue.message, String(issue.path[0] ?? ""));
  }
  const order = parsed.data;

  if (!rateLimit(`bsp:${order.bsp}`, 15, ONE_HOUR)) {
    return fail(429, "Too many attempts for this BSP number. Please try again later.");
  }

  const { data, error } = await supabaseAdmin().rpc("place_cart_order", {
    p_bsp: order.bsp,
    p_name: order.name,
    p_mobile: order.mobile,
    p_email: order.email ?? null,
    p_note: order.note ?? null,
    p_items: order.items,
  });
  const result = data?.[0];

  if (error || !result || result.o_error) {
    switch (result?.o_error) {
      case "BSP_NOT_FOUND":
        return fail(403, "We couldn't find that BSP number. Check it, or contact us.");
      case "EMPTY_CART":
        return fail(400, "Your cart is empty.", "items");
      case "BAD_PRODUCT":
        return fail(409, "A design in your cart is no longer available. Please review your cart.", "items");
      case "LIMIT_REACHED": {
        const left = result.o_remaining ?? 0;
        return fail(
          429,
          left > 0
            ? `Daily limit is ${DAILY_LIMIT} magnets per student. You can order ${left} more today.`
            : `You've reached today's limit of ${DAILY_LIMIT} magnets. Come back tomorrow!`,
          "items",
        );
      }
      default:
        console.error("place_cart_order failed", error ?? result);
        return fail(500, "Something went wrong. Please try again.");
    }
  }

  const qty = order.items.reduce((sum, item) => sum + item.qty, 0);
  after(async () => {
    const products = await getProductsBySlugs(order.items.map((item) => item.slug)).catch(() => []);
    const names = new Map(products.map((p) => [p.slug, p.name]));
    await sendOrderMails({
      code: result.o_code,
      name: order.name,
      bsp: order.bsp,
      mobile: order.mobile,
      email: order.email,
      variant: "basic",
      qty,
      total: result.o_total,
      note: order.note,
      items: order.items.map((item) => ({ name: names.get(item.slug) ?? item.slug, qty: item.qty })),
    });
  });

  return NextResponse.json({ code: result.o_code, total: result.o_total }, { status: 201 });
}
