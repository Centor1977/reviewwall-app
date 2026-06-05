import Link from "next/link";
import { Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Participant = { statut_avis: string };

export type SeancePreview = {
  id: string;
  titre: string;
  mode: string;
  statut: string;
  nb_participants_attendus: number | null;
  participants: Participant[];
};

type Props = {
  offreId: string;
  seances: SeancePreview[];
};

const STATUT_DOT: Record<string, string> = {
  active: "bg-green-500",
  en_cours: "bg-amber-500",
  ouverte: "bg-blue-500",
  cloturee: "bg-slate-400",
  archivee: "bg-slate-300",
};

const STATUT_LABEL: Record<string, string> = {
  active: "Active",
  en_cours: "En cours",
  ouverte: "Ouverte",
  cloturee: "Clôturée",
  archivee: "Archivée",
};

const STATUT_BADGE: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  en_cours: "bg-amber-50 text-amber-700",
  ouverte: "bg-blue-50 text-blue-700",
  cloturee: "bg-slate-100 text-slate-500",
  archivee: "bg-slate-100 text-slate-400",
};

const MODE_LABEL: Record<string, string> = {
  presentiel: "Présentiel",
  distance: "À distance",
  video: "Vidéo",
};

export function BlocSeances({ offreId, seances }: Props) {
  const preview = seances.slice(0, 3);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="card-section-title font-semibold text-slate-900">Séances</h2>
        <Link href={`/offres/${offreId}/seances`} className="text-xs text-blue-600 hover:underline">
          Voir toutes →
        </Link>
      </div>

      {seances.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-center">
          <Users size={22} className="mb-2 text-slate-300" />
          <p className="mb-3 text-sm text-slate-500">Aucune séance</p>
          <Link
            href={`/offres/${offreId}/seances/nouvelle`}
            className="flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium transition hover:bg-black/15"
            style={{ border: "1px solid rgba(255,255,255,0.18)", color: "#e2e8f0" }}
          >
            <Plus size={14} />
            Créer une séance
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {preview.map((s) => {
            const nbP = s.participants.length;
            const nbA = s.participants.filter((p) => p.statut_avis === "soumis").length;
            const pct = nbP > 0 ? Math.round((nbA / nbP) * 100) : 0;
            const dotColor = STATUT_DOT[s.statut] ?? "bg-slate-400";
            const badgeCls = STATUT_BADGE[s.statut] ?? "bg-slate-100 text-slate-500";

            return (
              <li key={s.id} className="py-3">
                <div className="flex items-start gap-2.5">
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dotColor)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 truncate">{s.titre}</span>
                      <span className="text-xs text-slate-400">
                        {MODE_LABEL[s.mode] ?? s.mode}
                        {nbP > 0 ? ` · ${nbP} participant${nbP > 1 ? "s" : ""}` : ""}
                      </span>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", badgeCls)}>
                        {STATUT_LABEL[s.statut] ?? s.statut}
                      </span>
                    </div>
                    {nbP > 0 && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="shrink-0 text-xs text-slate-400">{nbA}/{nbP} avis</span>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
