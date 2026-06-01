import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import { ProfileForm } from "./ProfileForm";
import { DangerZone } from "./DangerZone";

export default async function ParametresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const prestataire = await ensurePrestataire(supabase, user!.id);
  const vertical =
    VERTICALS[(prestataire?.vertical as Vertical) ?? DEFAULT_VERTICAL];

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Gérez votre profil et les préférences de votre compte.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile + Account sections (client) */}
        <ProfileForm
          prestataire={prestataire!}
          email={user!.email ?? ""}
        />

        {/* Vertical section (read-only, server-rendered) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Verticale
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Le secteur d&apos;activité de votre compte.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {vertical.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {vertical.prestataire.label} · {vertical.offre.label}s ·{" "}
                {vertical.client.label}s
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              Active
            </span>
          </div>

          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
            D&apos;autres verticales (coaching, service…) seront bientôt
            disponibles.
          </p>
        </div>

        {/* Danger zone (client) */}
        <DangerZone />
      </div>
    </div>
  );
}
