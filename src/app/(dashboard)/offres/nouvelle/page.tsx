import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import NouvelleOffreForm from "./NouvelleOffreForm";

export default async function NouvellePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const prestataire = await ensurePrestataire(supabase, user!.id);
  if (!prestataire) notFound();

  const verticalKey = (prestataire.vertical as Vertical) ?? DEFAULT_VERTICAL;
  const vertical = VERTICALS[verticalKey];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Nouvelle {vertical.offre.singular}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Renseignez les informations de votre {vertical.offre.singular}.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <NouvelleOffreForm prestataireId={prestataire.id} verticalKey={verticalKey} vertical={vertical} />
      </div>
    </div>
  );
}
