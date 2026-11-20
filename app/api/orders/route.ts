import { after, NextResponse, type NextRequest } from "next/server";
import { sendOrderMails } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";
import { DAILY_LIMIT, MAX_IMAGE_BYTES, detectImageType, orderSchema } from "@/lib/rules";
import { getStudent } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

const TEN_MINUTES = 10 * 60_000;
const ONE_HOUR = 60 * 60_000;
const MIME = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;
const FIELDS = ["name", "mobile", "email", "variant", "qty", "note"] as const;

const fail = (status: number, error: string, field?: string) =>
  NextResponse.json({ error, field }, { status });

export async function POST(req: NextRequest) {
  // CSRF: only accept same-origin form posts.
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return fail(403, "Forbidden.");

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`ip:${ip}`, 10, TEN_MINUTES)) {
    return fail(429, "Too many attempts. Please wait a few minutes and try again.");
  }
  const student = await getStudent();
  if (!student) return fail(401, "Please log in to place an order.");
  if (Number(req.headers.get("content-length") ?? 0) > MAX_IMAGE_BYTES + 100_000) {
    return fail(413, "Image is too large. Maximum size is 10 MB.");
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "Invalid form submission.");
  }

  // The BSP comes from the signed login session, never from the form.
  const raw = {
    ...Object.fromEntries(FIELDS.map((k) => [k, typeof form.get(k) === "string" ? form.get(k) : undefined])),
    bsp: student.bsp,
  };
  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(400, issue.message, String(issue.path[0] ?? ""));
  }
  const order = parsed.data;

  if (!rateLimit(`bsp:${order.bsp}`, 15, ONE_HOUR)) {
    return fail(429, "Too many attempts for this BSP number. Please try again later.");
  }

  const db = supabaseAdmin();

  // Verify the student BEFORE accepting any upload, so strangers can't fill storage.
  const { data: known, error: lookupError } = await db
    .from("bsp_allowlist")
    .select("bsp")
    .eq("bsp", order.bsp)
    .eq("active", true)
    .maybeSingle();
  if (lookupError) {
    console.error("Allowlist lookup failed", lookupError);
    return fail(500, "Something went wrong. Please try again.");
  }
  if (!known) {
    return fail(403, "We couldn't find that BSP number. Check it, or contact us.", "bsp");
  }

  let imagePath: string | null = null;
  if (order.variant === "custom") {
    const file = form.get("image");
    if (!(file instanceof File) || file.size === 0) {
      return fail(400, "Please upload your image for a Custom magnet.", "image");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return fail(413, "Image is too large. Maximum size is 10 MB.", "image");
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = detectImageType(bytes);
    if (!type) return fail(400, "Please use a JPG, PNG or WEBP image.", "image");

    imagePath = `${crypto.randomUUID()}.${type}`;
    const { error: uploadError } = await db.storage
      .from("uploads")
      .upload(imagePath, bytes, { contentType: MIME[type] });
    if (uploadError) {
      console.error("Image upload failed", uploadError);
      return fail(500, "Couldn't upload your image. Please try again.");
    }
  }

  const { data, error } = await db.rpc("place_order", {
    p_bsp: order.bsp,
    p_name: order.name,
    p_mobile: order.mobile,
    p_email: order.email ?? null,
    p_variant: order.variant,
    p_qty: order.qty,
    p_note: order.note ?? null,
    p_image_path: imagePath,
  });
  const result = data?.[0];

  if (error || !result || result.o_error) {
    if (imagePath) await db.storage.from("uploads").remove([imagePath]);
    if (result?.o_error === "BSP_NOT_FOUND") {
      return fail(403, "We couldn't find that BSP number. Check it, or contact us.", "bsp");
    }
    if (result?.o_error === "LIMIT_REACHED") {
      const left = result.o_remaining ?? 0;
      return fail(
        429,
        left > 0
          ? `Daily limit is ${DAILY_LIMIT} magnets per student. You can order ${left} more today.`
          : `You've reached today's limit of ${DAILY_LIMIT} magnets. Come back tomorrow!`,
        "qty",
      );
    }
    console.error("place_order failed", error ?? result);
    return fail(500, "Something went wrong. Please try again.");
  }

  after(() =>
    sendOrderMails({
      code: result.o_code,
      name: order.name,
      bsp: order.bsp,
      mobile: order.mobile,
      email: order.email,
      variant: order.variant,
      qty: order.qty,
      total: result.o_total,
      note: order.note,
    }),
  );

  return NextResponse.json({ code: result.o_code, total: result.o_total }, { status: 201 });
}
