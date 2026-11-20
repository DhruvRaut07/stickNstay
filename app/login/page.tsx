import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LoginHero } from "@/components/LoginHero";
import { safeNext } from "@/lib/auth";
import { getStudent } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in: StickNstay", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getStudent()) redirect(next);

  return (
    <div className="flex min-h-screen flex-wrap gap-6 bg-paper p-4 sm:p-6">
      <LoginHero />

      <main className="flex flex-[1_1_460px] items-center justify-center px-1 py-7">
        <div className="relative w-full max-w-[540px] rounded-[32px] border border-line bg-surface px-6 pb-8 pt-14 shadow-[0_28px_60px_rgba(27,27,47,0.1),0_4px_0_var(--sns-line)] sm:px-11 sm:pb-11 sm:pt-[60px]">
          {/* The magnet "pin" at the top of the card. */}
          <div
            aria-hidden="true"
            className="absolute -top-[22px] left-1/2 size-11 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#e4e1db_65%,#b9b4aa)] shadow-[0_8px_14px_rgba(27,27,47,0.25)]"
          />
          <div className="flex flex-wrap items-center justify-between gap-x-4">
            <Link href="/" aria-label="stickNstay home" className="inline-block">
              <Logo className="h-[38px] sm:h-[46px]" />
            </Link>
            {/* A visible way out: the shop works without logging in, only checkout needs it. */}
            <Link href="/shop" className="inline-flex min-h-11 items-center font-semibold text-link hover:underline">
              Keep browsing ›
            </Link>
          </div>
          <h1 className="mt-9 text-[40px] font-bold leading-[1.04] sm:text-[56px]">Log in to order.</h1>
          <p className="mb-8 mt-3.5 text-lg leading-relaxed text-muted">
            stickNstay is for IBS Mumbai students. Verify with your BSP number and college email to place an order.
          </p>
          <LoginForm next={next} />
        </div>
      </main>
    </div>
  );
}
