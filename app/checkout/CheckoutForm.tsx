"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { logout } from "@/app/login/actions";
import { DAILY_LIMIT } from "@/lib/rules";
import { useCart } from "@/lib/use-cart";

type FieldError = { message: string; field?: string };

const input =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-base placeholder:text-muted transition focus:border-fg";

export function CheckoutForm({
  student,
  catalog,
  price,
}: {
  student: { name: string; bsp: string };
  catalog: readonly { slug: string; name: string }[];
  price: number;
}) {
  const router = useRouter();
  const { ready, items, count, clear } = useCart();
  const [error, setError] = useState<FieldError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlaced, setIsPlaced] = useState(false);

  const names = new Map(catalog.map((p) => [p.slug, p.name]));
  const total = count * price;
  const errorFor = (field: string) => (error?.field === field ? error.message : null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: text("name"),
          mobile: text("mobile"),
          email: text("email"),
          note: text("note"),
          items,
        }),
      });
      if (res.status === 401) {
        router.push("/login?next=/checkout");
        return;
      }
      const body = await res.json();
      if (!res.ok) {
        setError({ message: body.error ?? "Something went wrong.", field: body.field });
        return;
      }
      setIsPlaced(true);
      clear();
      router.push(`/thank-you/${body.code}`);
    } catch {
      setError({ message: "Network problem. Check your connection and try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isPlaced) {
    return (
      <p role="status" className="py-20 text-center text-lg font-semibold">
        Order placed! Taking you to your receipt…
      </p>
    );
  }

  if (!ready) {
    return (
      <p role="status" className="py-20 text-center text-muted">
        Loading your cart…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-xl font-semibold">Your cart is empty.</p>
        <Link href="/shop" className="btn press mt-8">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Its own form: a button inside the order form would submit the order instead. */}
      <form
        action={logout}
        className="mt-8 flex items-center justify-between gap-3 rounded-2xl bg-accent/40 p-4 text-sm"
      >
        <p>
          Signed in as <strong>{student.name}</strong> · {student.bsp}
        </p>
        <button className="min-h-11 font-semibold text-link hover:underline">Log out</button>
      </form>

      <section aria-label="Order summary" className="mt-6 rounded-[28px] border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
        <ul className="divide-y divide-dashed divide-line">
          {items.map((item) => (
            <li key={item.slug} className="flex items-center justify-between gap-4 py-3">
              <span>
                {names.get(item.slug) ?? item.slug} <span className="text-muted">× {item.qty}</span>
              </span>
              <span className="font-semibold">₹{item.qty * price}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted">
          {count} of {DAILY_LIMIT} magnets today ·{" "}
          <Link href="/cart" className="font-semibold text-link hover:underline">
            Edit cart
          </Link>
        </p>
      </section>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
        <Field label="Full name" error={errorFor("name")}>
          <input name="name" autoComplete="name" required maxLength={80} defaultValue={student.name} className={input} />
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
        <Field label="Email (optional)" error={errorFor("email")} hint="For an order confirmation.">
          <input name="email" type="email" autoComplete="email" className={input} />
        </Field>
        <Field label="Note (optional)" error={errorFor("note")}>
          <textarea name="note" rows={2} maxLength={200} className={input} />
        </Field>

        <div aria-live="polite">
          {error && (!error.field || error.field === "items") && (
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
          <button type="submit" disabled={isSubmitting} className="btn press px-8 disabled:opacity-50">
            {isSubmitting ? "Placing order…" : "Place order"}
          </button>
        </div>
      </form>
    </>
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
