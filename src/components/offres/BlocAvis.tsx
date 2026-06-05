import Link from "next/link";
import { Star, MessageSquare } from "lucide-react";

export type AvisPreview = {
  id: string;
  note: number | null;
  avis_texte: string | null;
  profil: Record<string, unknown> | null;
  created_at: string;
};

type Props = {
  offreId: string;
  avis: AvisPreview[];
};

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(iso));
}

export function BlocAvis({ offreId, avis }: Props) {
  const preview = avis.slice(0, 3);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="card-section-title font-semibold text-slate-900">Derniers avis</h2>
        <Link href={`/offres/${offreId}/avis`} className="text-xs text-blue-600 hover:underline">
          Voir tous →
        </Link>
      </div>

      {avis.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-center">
          <MessageSquare size={22} className="mb-2 text-slate-300" />
          <p className="text-sm text-slate-500">Aucun avis pour l&apos;instant</p>
          <p className="mt-1 text-xs text-slate-400">
            Partagez vos liens de collecte pour obtenir vos premiers avis.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {preview.map((a) => {
            const situation = (a.profil?.situation ?? a.profil?.type_client ?? null) as string | null;
            return (
              <li key={a.id} className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {situation && (
                      <p className="mb-0.5 text-xs text-slate-500">{situation}</p>
                    )}
                    {a.avis_texte && (
                      <p className="truncate text-sm text-slate-700">{a.avis_texte}</p>
                    )}
                    {!a.avis_texte && !situation && (
                      <p className="text-xs text-slate-400 italic">Avis sans commentaire</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={11}
                          className={
                            i <= (a.note ?? 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-none text-slate-200"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400">{relativeDate(a.created_at)}</span>
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
