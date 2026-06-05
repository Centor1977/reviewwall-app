import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/admin";
import { SignalementActions } from "./SignalementActions";

type SearchParams = { statut?: string; raison?: string };

export default async function AdminSignalementsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminUser();
  const supabase = await createClient();
  const { statut = "en_attente", raison } = await searchParams;

  let query = supabase.from("signalements")
    .select("id, raison, detail, statut, created_at, avis_id, avis:avis_id(id, note, avis_texte, masque, offre_id, offres:offre_id(titre))")
    .order("created_at", { ascending: false });
  if (statut) query = query.eq("statut", statut);
  if (raison) query = query.eq("raison", raison);
  const { data: signalements } = await query;

  const { count: enAttente } = await supabase.from("signalements").select("*", { count: "exact", head: true }).eq("statut", "en_attente");

  const fmt = (d: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
  const raisonLabels: Record<string, string> = { spam: "Spam", faux_avis: "Faux avis", contenu_inapproprie: "Contenu inapproprié", autre: "Autre" };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Signalements</h1>
        {(enAttente ?? 0) > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-semibold text-white">{enAttente}</span>}
      </div>
      <form method="GET" className="mb-6 flex flex-wrap gap-3">
        <select name="statut" defaultValue={statut} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="en_attente">En attente</option>
          <option value="traite">Traités</option>
          <option value="rejete">Rejetés</option>
          <option value="">Tous</option>
        </select>
        <select name="raison" defaultValue={raison ?? ""} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">Toutes les raisons</option>
          <option value="spam">Spam</option>
          <option value="faux_avis">Faux avis</option>
          <option value="contenu_inapproprie">Contenu inapproprié</option>
          <option value="autre">Autre</option>
        </select>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Filtrer</button>
      </form>

      {(signalements ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-400">Aucun signalement{statut ? ` "${statut}"` : ""}.</div>
      ) : (
        <div className="space-y-4">
          {(signalements ?? []).map((s) => {
            const avis = Array.isArray(s.avis) ? s.avis[0] : s.avis;
            const offre = avis ? (Array.isArray(avis.offres) ? avis.offres[0] : avis.offres) : null;
            return (
              <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.raison === "spam" ? "bg-orange-50 text-orange-700" : s.raison === "faux_avis" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                        {raisonLabels[s.raison] ?? s.raison}
                      </span>
                      <StatutBadge statut={s.statut} />
                    </div>
                    {s.detail && <p className="mt-1 text-xs text-slate-500">{s.detail}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{fmt(s.created_at)}</span>
                </div>
                {avis && (
                  <div className="mb-3 rounded-lg bg-slate-50 px-4 py-3">
                    <p className="mb-1 text-xs text-slate-400">{offre?.titre ?? "—"} · {"★".repeat(avis.note ?? 0)}{avis.masque && <span className="ml-2 text-red-500">[masqué]</span>}</p>
                    <p className="text-sm text-slate-700">{avis.avis_texte?.slice(0, 200) ?? "(pas de texte)"}</p>
                  </div>
                )}
                {s.statut === "en_attente" && avis && (
                  <SignalementActions signalementId={s.id} avisId={avis.id} avisTexte={avis.avis_texte ?? ""} avisDejamasque={avis.masque} />
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-6">
        <Link href="/admin/avis?statut=masque" className="text-sm text-blue-600 hover:underline">Voir tous les avis masqués →</Link>
      </div>
    </div>
  );
}

function StatutBadge({ statut }: { statut: string }) {
  const colors: Record<string, string> = { en_attente: "bg-orange-50 text-orange-700", traite: "bg-green-50 text-green-700", rejete: "bg-slate-100 text-slate-500" };
  const labels: Record<string, string> = { en_attente: "En attente", traite: "Traité", rejete: "Rejeté" };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[statut] ?? "bg-slate-100 text-slate-600"}`}>{labels[statut] ?? statut}</span>;
}
