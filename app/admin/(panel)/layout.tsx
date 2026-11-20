import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdmin } from "@/lib/supabase";

/**
 * Shell for every signed-in admin screen. One session check here, and each page and
 * server action still re-checks with requireAdmin().
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const email = await getAdmin();
  if (!email) redirect("/admin/login?error=session");

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_minmax(0,1fr)]">
      <AdminSidebar email={email} />
      <main className="bg-paper">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-5 py-8 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
