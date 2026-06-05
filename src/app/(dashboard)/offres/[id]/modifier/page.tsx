import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import { OffreForm } from "@/components/offres/OffreForm";

type Params = { id: string };

export default async function ModifierOffrePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const prestataire = await ensurePrestataire(supabase, user!.id);
  if (!prestataire) notFound();

  const { data: offre } = await supabase
    .from("offres")
    .select(
      "id, slug, titre, active, description, description_courte, description_longue, image_url, niveau, duree, format, langue, prix, tags, categorie, url_externe, metadata_vertical"
    )
    .eq("id", id)
    .eq("prestataire_id", prestataire.id)
    .maybeSingle();

  if (!offre) notFound();

  const verticalKey = (prestataire.vertical as Vertical) ?? DEFAULT_VERTICAL;
  const vertical = VERTICALS[verticalKey];

  return (
    <div className="max-w-2xl">
      <Link
        href={`/offres/${id}`}
        className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={15} />
        Retour à la {vertical.offre.singular}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Modifier la fiche</h1>
        <p className="mt-0.5 text-sm text-slate-500">{offre.titre}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <OffreForm
          mode="modification"
          prestataireId={prestataire.id}
          verticalKey={verticalKey}
          vertical={vertical}
          offre={offre}
        />
      </div>
    </div>
  );
}
