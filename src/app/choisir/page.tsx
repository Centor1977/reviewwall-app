import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRoles } from "@/lib/roles";
import { appConfig } from "@/config/app";
import Link from "next/link";

export default async function ChoisirPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { isPrestataire, isApprenant } = await getUserRoles(supabase, user.id);

  // Redirect si un seul rôle
  if (isPrestataire && !isApprenant) redirect("/dashboard");
  if (isApprenant && !isPrestataire) redirect("/mon-profil");
  if (!isPrestataire && !isApprenant) redirect("/login");

  const { data: prestataire } = await supabase
    .from("prestataires")
    .select("nom")
    .eq("user_id", user.id)
    .maybeSingle();

  const prenom = prestataire?.nom?.split(" ")[0] ?? user.email?.split("@")[0] ?? "vous";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <span className="text-base font-bold text-slate-900">{appConfig.name}</span>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Bonjour {prenom}, que souhaitez-vous faire aujourd&apos;hui ?
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard"
            className="group flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <span className="text-4xl">🎓</span>
            <div>
              <p className="font-semibold text-slate-900">Mon espace formateur</p>
              <p className="mt-1 text-sm text-slate-500">
                Gérez vos formations, séances et avis collectés.
              </p>
            </div>
            <span className="mt-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition group-hover:bg-blue-700">
              Accéder
            </span>
          </Link>

          <Link
            href="/mon-profil"
            className="group flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <span className="text-4xl">⭐</span>
            <div>
              <p className="font-semibold text-slate-900">Mon espace apprenant</p>
              <p className="mt-1 text-sm text-slate-500">
                Retrouvez vos avis et enrichissez votre profil.
              </p>
            </div>
            <span className="mt-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition group-hover:bg-blue-700">
              Accéder
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
