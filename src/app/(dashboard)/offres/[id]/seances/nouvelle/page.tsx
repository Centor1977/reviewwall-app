import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { NouvelleSeanceForm } from "./NouvelleSeanceForm";

type Params = { id: string };

export default async function NouvelleSeancePage({
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
    .select("id, titre")
    .eq("id", id)
    .eq("prestataire_id", prestataire.id)
    .maybeSingle();

  if (!offre) notFound();

  return (
    <div className="max-w-xl">
      <Link
        href={`/offres/${id}`}
        className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={15} />
        {offre.titre}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Nouvelle séance</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Configurez les détails de la séance de collecte.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <NouvelleSeanceForm offreId={id} />
      </div>
    </div>
  );
}
