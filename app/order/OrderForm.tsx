"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { OrderPlaced } from "@/components/OrderPlaced";
import { DAILY_LIMIT, MAX_IMAGE_BYTES, PRICES, type Variant } from "@/lib/rules";
import { DEMO_ORDERS } from "@/lib/site";

type FieldError = { message: string; field?: string };

/** Looks like a real code (SNS-XXXXXXXX). Demo only: it is not saved anywhere. */
function makeDemoCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return `SNS-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

const input =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-base placeholder:text-muted transition focus:border-fg";

export function OrderForm({ initialVariant }: { initialVariant: Variant }) {
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>(initialVariant);
  const [qty, setQty] = useState(1);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<FieldError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);

  const total = PRICES[variant] * qty;
  const errorFor = (field: string) => (error?.field === field ? error.message : null);

  function showDemoSuccess() {
    setDemoCode(makeDemoCode());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    const image = form.get("image");
    if (variant === "custom" && image instanceof File && image.size > MAX_IMAGE_BYTES) {
      setError({ message: "Image is too large. Maximum size is 10 MB.", field: "image" });
      return;
    }
    if (variant === "basic") form.delete("image");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", { method: "POST", body: form });
      if (DEMO_ORDERS && res.status >= 500) {
        showDemoSuccess();
        return;
      }
      const body = await res.json();
      if (!res.ok) {
        setError({ message: body.error ?? "Something went wrong.", field: body.field });
        return;
      }
      router.push(`/thank-you/${body.code}`);
    } catch {
      if (DEMO_ORDERS) {
        showDemoSuccess();
        return;
      }
      setError({ message: "Network problem. Check your connection and try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (demoCode) return <OrderPlaced code={demoCode} variant={variant} qty={qty} total={total} />;

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
      <fieldset>
        <legend className="mb-3 text-sm font-medium">Magnet type</legend>
        <div className="grid grid-cols-2 gap-3">
          {(["basic", "custom"] as const).map((v) => (
            <label
              key={v}
              className={`press cursor-pointer rounded-2xl border-2 p-4 transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-fg ${
                variant === v ? "border-fg bg-accent" : "border-line bg-surface"
              }`}
            >
              <input
                type="radio"
                name="variant"
                value={v}
                checked={variant === v}
                onChange={() => setVariant(v)}
                className="sr-only"
              />
              <span className="block font-semibold capitalize">{v}</span>
              <span className="text-sm text-muted">₹{PRICES[v]} each</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Full name" error={errorFor("name")}>
        <input name="name" autoComplete="name" required maxLength={80} className={input} />
      </Field>
      <Field label="Mobile number" error={errorFor("mobile")}>
        <input
          name="mobile"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="10-digit number"
          required
          className={input}
        />
      </Field>
      <Field
        label="BSP number"
        error={errorFor("bsp")}
        hint="Your college-issued ID. We use it to verify you're in our batch."
      >
        <input name="bsp" autoCapitalize="characters" autoComplete="off" required className={input} />
      </Field>
      <Field label="Email (optional)" error={errorFor("email")} hint="For an order confirmation.">
        <input name="email" type="email" autoComplete="email" className={input} />
      </Field>

      <Field label={`Quantity (max ${DAILY_LIMIT} per day)`} error={errorFor("qty")}>
        <select
          name="qty"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className={input}
        >
          {Array.from({ length: DAILY_LIMIT }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </Field>

      {variant === "custom" && (
        <Field label="Your image" error={errorFor("image")} hint="JPG, PNG or WEBP, up to 10 MB.">
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            className={`${input} file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-accent-fg`}
          />
          {fileName && <p className="mt-2 truncate text-sm text-muted">{fileName}</p>}
        </Field>
      )}

      <Field label="Note (optional)" error={errorFor("note")}>
        <textarea name="note" rows={2} maxLength={200} className={input} />
      </Field>

      <div aria-live="polite">
        {error && !error.field && (
          <p role="alert" className="rounded-2xl bg-magnet/10 p-4 text-sm font-medium text-link">
            {error.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-6">
        <div>
          <p className="text-sm text-muted">Total · cash on delivery</p>
          <p className="text-3xl font-bold tracking-tight">₹{total}</p>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn press px-8 disabled:opacity-50"
        >
          {isSubmitting ? "Placing order…" : "Place order"}
        </button>
      </div>
    </form>
  );
}

type FieldProps = { label: string; hint?: string; error: string | null; children: ReactNode };

function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-sm text-muted">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1.5 block text-sm font-medium text-link">
          {error}
        </span>
      )}
    </label>
  );
}
