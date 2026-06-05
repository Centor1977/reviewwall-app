import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { appConfig } from "@/config/app";
import { getUserRoles } from "@/lib/roles";
import { RoleSwitcher } from "@/components/ui/RoleSwitcher";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion-apprenant");
}

// TODO: dark mode apprenant —
// changer la classe du wrapper en 'apprenant-dark'
// et créer src/styles/apprenant-dark.css avec les tokens correspondants

export default async function ApprenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion-apprenant");

  const { isPrestataire } = await getUserRoles(supabase, user.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/mon-profil" className="text-sm font-bold text-slate-900">
            {appConfig.name}
            <span className="ml-2 font-normal text-slate-400">· Mon espace</span>
          </Link>
          <div className="flex items-center gap-2">
            {isPrestataire && <RoleSwitcher currentRole="apprenant" />}
            <form action={signOut}>
              <button type="submit" className="text-xs text-slate-400 transition hover:text-slate-700">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
    </div>
  );
}
