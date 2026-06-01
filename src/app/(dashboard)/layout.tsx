import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { appConfig } from "@/config/app";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import { SidebarNav } from "@/components/SidebarNav";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(appConfig.auth.afterLogoutUrl);
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(appConfig.auth.loginUrl);

  const prestataire = await ensurePrestataire(supabase, user.id);
  const vertical =
    VERTICALS[(prestataire?.vertical as Vertical) ?? DEFAULT_VERTICAL];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Sidebar ── */}
      <aside className="flex h-full w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center border-b border-slate-200 px-5">
          <Link
            href="/dashboard"
            className="text-sm font-bold text-slate-900 transition-colors duration-150 hover:text-blue-600"
          >
            {appConfig.name}
          </Link>
        </div>

        {/* Navigation */}
        <SidebarNav offreLabel={`${vertical.offre.label}s`} />

        {/* Prestataire */}
        <div className="shrink-0 border-t border-slate-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {(prestataire?.nom ?? user.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                {prestataire?.nom ?? user.email}
              </p>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-xs text-slate-400 transition-colors duration-150 hover:text-slate-700"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
