import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Sticker } from "@/components/Sticker";

export const metadata: Metadata = { title: "Page not found: StickNstay" };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-xl flex-col items-center px-5 py-16 text-center sm:py-24">
        <Sticker name="06-gen-z-and-funny/overthinking-brb" tilt={-4} className="w-64 sm:w-80" />
        <h1 className="headline mt-6">404. Page not found.</h1>
        <p className="mt-3 text-lg text-muted">This page wandered off. The magnets are still here though.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn press">
            Back to home
          </Link>
          <Link href="/shop" className="btn-ghost press">
            Browse the shop
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
