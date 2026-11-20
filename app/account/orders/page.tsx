import type { Metadata } from "next";
import Link from "next/link";
import { AccountNav } from "@/components/AccountNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { requireStudent } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata: Metadata = { title: "My orders: StickNstay", robots: { index: false } };

const MAX_ORDERS = 50;

type Status = "new" | "confirmed" | "delivered" | "cancelled";

type OrderRow = {
  code: string;
  variant: "basic" | "custom";
  qty: number;
  total: number;
  status: Status;
  created_at: string;
  order_items: { product_name: string; qty: number }[];
};

const STATUS: Record<Status, { label: string; className: string }> = {
  new: { label: "Placed", className: "bg-accent text-fg" },
  confirmed: { label: "Confirmed", className: "bg-accent text-fg" },
  delivered: { label: "Delivered", className: "bg-fg text-accent" },
  cancelled: { label: "Cancelled", className: "bg-paper text-muted" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

export default async function OrdersPage() {
  const student = await requireStudent("/account/orders");
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("code, variant, qty, total, status, created_at, order_items(product_name, qty)")
    .eq("bsp", student.bsp)
    .order("created_at", { ascending: false })
    .limit(MAX_ORDERS)
    .returns<OrderRow[]>();
  const orders = data ?? [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-5 sm:py-12">
        <h1 className="headline">My orders.</h1>
        <div className="mt-6">
          <AccountNav active="orders" />
        </div>

        {error && (
          <p role="alert" className="mt-8 rounded-2xl bg-magnet/10 p-4 text-sm font-medium text-link">
            Couldn&apos;t load your orders. Please try again.
          </p>
        )}

        {!error && orders.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-xl font-semibold">No orders yet.</p>
            <p className="mt-2 text-muted">Your orders will show up here once you place one.</p>
            <Link href="/shop" className="btn press mt-8">
              Browse the shop
            </Link>
          </div>
        )}

        <ul className="mt-8 space-y-4">
          {orders.map((order) => {
            const status = STATUS[order.status];
            return (
              <li
                key={order.code}
                className="rounded-[28px] border border-line bg-surface p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold tracking-wide">{order.code}</p>
                    <p className="text-sm text-muted">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <ul className="mt-4 space-y-1 text-[15px]">
                  {order.order_items.length > 0 ? (
                    order.order_items.map((item) => (
                      <li key={item.product_name}>
                        {item.qty} × {item.product_name}
                      </li>
                    ))
                  ) : (
                    <li>
                      {order.qty} × {order.variant === "custom" ? "Custom photo magnet" : "Magnet"}
                    </li>
                  )}
                </ul>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-line pt-4">
                  <p>
                    <span className="text-xl font-bold">₹{order.total}</span>{" "}
                    <span className="text-sm text-muted">· cash on delivery</span>
                  </p>
                  <Link
                    href={`/thank-you/${order.code}`}
                    className="inline-flex min-h-11 items-center font-semibold text-link hover:underline"
                  >
                    View receipt ›
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
