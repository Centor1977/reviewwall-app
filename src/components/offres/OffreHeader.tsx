import { type ReactNode } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Star } from "lucide-react";
import { OffreCoverImage } from "./OffreCoverImage";

type OffreData = {
  id: string;
  titre: string;
  categorie: string | null;
  image_url: string | null;
  niveau: string | null;
  format: string | null;
  duree: string | null;
  prix: string | null;
  metadata_vertical: Record<string, unknown> | null;
};

type Props = {
  offre: OffreData;
  completionScore: number;
  stats: {
    noteMoyenne: number | null;
    nbAvis: number;
    deltaAvisSemaine: number;
    pourcentRecommande: number | null;
    nbSeances: number;
    nbParticipants: number;
    tauxReponse: number | null;
  };
  publicUrl: string;
};

const NIVEAU_LABELS: Record<string, string> = {
  tous_niveaux: "Tous niveaux",
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

const FORMAT_LABELS: Record<string, string> = {
  presentiel: "Présentiel",
  distanciel: "Distanciel",
  blended: "Blended",
  video: "Vidéo",
  mixte: "Mixte",
};

const FORMAT_COLORS: Record<string, string> = {
  presentiel: "bg-blue-50 text-blue-700",
  distanciel: "bg-violet-50 text-violet-700",
  blended: "bg-emerald-50 text-emerald-700",
  video: "bg-rose-50 text-rose-700",
  mixte: "bg-amber-50 text-amber-700",
};

const NIVEAU_COLORS: Record<string, string> = {
  tous_niveaux: "bg-slate-100 text-slate-600",
  debutant: "bg-green-50 text-green-700",
  intermediaire: "bg-amber-50 text-amber-700",
  avance: "bg-red-50 text-red-600",
};

export function OffreHeader({ offre, completionScore, stats, publicUrl }: Props) {
  const cpf = offre.metadata_vertical?.cpf === true;
  const needsCompletion = completionScore < 100;

  return (
    <div
      className="mb-4"
      style={{
        background: "#30302E",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.10)",
        overflow: "hidden",
      }}
    >
      {/* Zone cover + contenu */}
      <div style={{ display: "flex", minHeight: 160 }}>
        <OffreCoverImage
          offreId={offre.id}
          imageUrl={offre.image_url}
          categorie={offre.categorie}
        />

        {/* Contenu + actions */}
        <div
          className="flex min-w-0 flex-1 items-start justify-between gap-4"
          style={{ padding: "20px 24px" }}
        >
          <div className="min-w-0">
            <nav className="mb-1 text-xs text-slate-400">
              <Link href="/offres" className="transition hover:text-slate-600">
                Mes formations
              </Link>
              <span className="mx-1">›</span>
              <span className="text-slate-600">{offre.titre}</span>
            </nav>

            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.2 }}>
              {offre.titre}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {offre.format && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${FORMAT_COLORS[offre.format] ?? "bg-slate-100 text-slate-600"}`}>
                  {FORMAT_LABELS[offre.format] ?? offre.format}
                </span>
              )}
              {offre.niveau && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${NIVEAU_COLORS[offre.niveau] ?? "bg-slate-100 text-slate-600"}`}>
                  {NIVEAU_LABELS[offre.niveau] ?? offre.niveau}
                </span>
              )}
              {cpf && (
                <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  CPF
                </span>
              )}
              {offre.duree && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                  {offre.duree}
                </span>
              )}
              {offre.prix && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                  {offre.prix}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Link
              href={`/offres/${offre.id}/seances/nouvelle`}
              className="flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition hover:bg-black/15"
              style={{
                border: "1px solid rgba(255,255,255,0.35)",
                color: "#ffffff",
              }}
            >
              <Plus size={15} />
              Nouvelle séance
            </Link>

            <div className="flex items-center gap-2">
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium transition hover:bg-black/15"
                style={{
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "#e2e8f0",
                }}
              >
                <Eye size={14} />
                Fiche publique
              </a>

              <Link
                href={`/offres/${offre.id}/modifier`}
                className="flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium transition hover:bg-black/15"
                style={{
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "#e2e8f0",
                }}
              >
                <Pencil size={14} />
                {needsCompletion ? "Compléter la fiche" : "Modifier"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Barre stats */}
      <div
        className="stats-bar grid grid-cols-6"
        style={{
          background: "#1e1e1e",
          borderTop: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <StatCell
          label="NOTE MOYENNE"          
          value={stats.noteMoyenne !== null ? stats.noteMoyenne.toFixed(1) : "—"}
		  unit = {<Star size={10} className='inline fill-yellow-400 text-yellow-400' />}
        />
        <StatCell
          label="AVIS"
          value={String(stats.nbAvis)}
          sub={
            stats.deltaAvisSemaine > 0 ? (
              <span className="font-medium text-green-600">
                +{stats.deltaAvisSemaine} cette sem.
              </span>
            ) : undefined
          }
        />
        <StatCell
          label="RECOMMANDENT"
          value={stats.pourcentRecommande !== null ? `${stats.pourcentRecommande}%` : "—"}
        />
        <StatCell label="SÉANCES" value={String(stats.nbSeances)} />
        <StatCell label="PARTICIPANTS" value={String(stats.nbParticipants)} />
        <StatCell
          label="TAUX DE RÉPONSE"
          value={stats.tauxReponse !== null ? `${stats.tauxReponse}%` : "—"}
        />
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  sub,
  unit,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  unit?: ReactNode;
}) {
  return (
    <div className="stat-cell flex flex-col items-center justify-center px-2 py-[10px] text-center">
      <span className="text-sm font-semibold text-[20px] text-slate-900">{value} {unit}</span>
      <span className="mt-0.5 text-[14px] text-slate-400">{label}</span>
      {sub && <span className="mt-0.5 text-[13px] text-slate-400">{sub}</span>}
    </div>
  );
}
