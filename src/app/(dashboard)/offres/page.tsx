import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import { cn } from "@/lib/utils";
import { Plus, ChevronRight, BookOpen, Star } from "lucide-react";

const NIVEAU_SHORT: Record<string, string> = {
  tous_niveaux: "Tous niveaux", debutant: "Débutant",
  intermediaire: "Intermédiaire", avance: "Avancé",
};
const FORMAT_SHORT: Record<string, string> = {
  presentiel: "Présentiel", distanciel: "Distanciel",
  blended: "Blended", video: "Vidéo", mixte: "Mixte",
};

type OffreWithAvis = {
  id: string; titre: string; categorie: string | null; active: boolean;
  created_at: string; description_courte: string | null; image_url: string | null;
  niveau: string | null; format: string | null; prix: number | null;
  metadata_vertical: Record<string, unknown> | null;
  avis: { id: string; note: number | null }[];
};

export default async function OffresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const prestataire = await ensurePrestataire(supabase, user!.id);
  const vertical =
    VERTICALS[(prestataire?.vertical as Vertical) ?? DEFAULT_VERTICAL];
  const offreLabel = vertical.offre;

  let list: OffreWithAvis[] = [];

  if (prestataire) {
    const { data } = await supabase
      .from("offres")
      .select("id, titre, categorie, active, created_at, description_courte, image_url, niveau, format, prix, metadata_vertical, avis(id, note)")
      .eq("prestataire_id", prestataire.id)
      .order("created_at", { ascending: false });
    list = (data ?? []) as OffreWithAvis[];
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Mes {offreLabel.plural}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {list.length}{" "}
            {list.length !== 1 ? offreLabel.plural : offreLabel.singular}
          </p>
        </div>
        <Link
          href="/offres/nouvelle"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={16} />
          Nouvelle {offreLabel.singular}
        </Link>
      </div>

      {/* Empty state */}
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <BookOpen size={32} className="mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">
            Aucune {offreLabel.singular} pour l&apos;instant
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Créez votre première {offreLabel.singular} pour commencer à
            collecter des avis.
          </p>
          <Link
            href="/offres/nouvelle"
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700"
          >
            Créer une {offreLabel.singular}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((offre) => {
            const avisCount = offre.avis.length;
            const avgNote =
              avisCount > 0
                ? offre.avis.reduce((s, a) => s + (a.note ?? 0), 0) /
                  avisCount
                : null;

            const cpf = (offre.metadata_vertical as Record<string, unknown> | null)?.cpf === true;

            return (
              <div key={offre.id}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 transition-shadow hover:shadow-sm">

                {/* Thumbnail */}
                {offre.image_url ? (
                  <img src={offre.image_url} alt={offre.titre}
                    className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <BookOpen size={18} className="text-blue-600" />
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-medium text-slate-900">{offre.titre}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium",
                      offre.active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500")}>
                      {offre.active ? "Actif" : "Inactif"}
                    </span>
                    {offre.niveau && NIVEAU_SHORT[offre.niveau] && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        {NIVEAU_SHORT[offre.niveau]}
                      </span>
                    )}
                    {offre.format && FORMAT_SHORT[offre.format] && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        {FORMAT_SHORT[offre.format]}
                      </span>
                    )}
                    {cpf && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">CPF</span>
                    )}
                    {offre.prix != null && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {offre.prix === 0 ? "Gratuit" : `${offre.prix} €`}
                      </span>
                    )}
                  </div>
                  {offre.description_courte && (
                    <p className="mt-0.5 truncate text-xs text-slate-400">{offre.description_courte}</p>
                  )}
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    {offre.categorie && <span>{offre.categorie}</span>}
                    {avgNote !== null && (
                      <span className="flex items-center gap-1">
                        <Star size={10} className="fill-yellow-400 text-yellow-400" />
                        {avgNote.toFixed(1)}
                      </span>
                    )}
                    <span>{avisCount} avis</span>
                  </div>
                </div>

                <Link href={`/offres/${offre.id}`}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                  Gérer <ChevronRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
