import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import { appConfig } from "@/config/app";
import {
  LayoutDashboard,
  Users,
  Star,
  Flag,
  BookOpen,
  ScrollText,
  ShieldAlert,
} from "lucide-react";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

const NAV = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/prestataires", label: "Prestataires", icon: Users },
  { href: "/admin/avis", label: "Avis", icon: Star },
  { href: "/admin/signalements", label: "Signalements", icon: Flag },
  { href: "/admin/offres", label: "Offres", icon: BookOpen },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const admin = await getAdminUser(supabase);
  if (!admin) redirect("/dashboard");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: pendingSignalements } = await supabase
    .from("signalements")
    .select("*", { count: "exact", head: true })
    .eq("statut", "en_attente");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Sidebar ── */}
      <aside className="flex h-full w-60 shrink-0 flex-col bg-slate-900">
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-700 px-5">
          <ShieldAlert size={16} className="text-red-500" />
          <span className="text-sm font-bold text-slate-100">
            {appConfig.name}
          </span>
          <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {NAV.map(({ href, label, icon: Icon }) => {
              const isSignalements = href === "/admin/signalements";
              const badge =
                isSignalements && (pendingSignalements ?? 0) > 0
                  ? pendingSignalements
                  : null;

              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="flex-1">{label}</span>
                    {badge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User + logout */}
        <div className="shrink-0 border-t border-slate-700 px-4 py-4">
          <p className="truncate text-xs text-slate-400">
            {user?.email}
          </p>
          <form action={signOut} className="mt-1">
            <button
              type="submit"
              className="text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
