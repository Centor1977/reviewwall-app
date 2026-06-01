import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import OnboardingWizard from "./OnboardingWizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const prestataire = await ensurePrestataire(supabase, user!.id);
  if (!prestataire) redirect("/login");

  if (prestataire.onboarding_completed) redirect("/dashboard");

  const vertical =
    VERTICALS[(prestataire.vertical as Vertical) ?? DEFAULT_VERTICAL];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Bienvenue 👋</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quelques étapes pour configurer votre compte.
        </p>
      </div>
      <OnboardingWizard prestataire={prestataire} vertical={vertical} />
    </div>
  );
}
