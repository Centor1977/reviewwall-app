import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/admin";
import { AvisAdminActions } from "./AvisAdminActions";

const PAGE_SIZE = 20;
type SearchParams = { q?: string; statut?: string; note?: string; prestataire?: string; page?: string };

export default async function AdminAvisPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminUser();
  const supabase = await createClient();
  const { q, statut, note, prestataire: prestataireFiltreId, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: prestataires } = await supabase.from("prestataires").select("id, nom").order("nom");

  let offreIdsFiltres: string[] | null = null;
  if (prestataireFiltreId) {
    const { data: offres } = await supabase.from("offres").select("id").eq("prestataire_id", prestataireFiltreId);
    offreIdsFiltres = (offres ?? []).map((o) => o.id);
  }
  if (offreIdsFiltres !== null && offreIdsFiltres.length === 0) {
    return <div><h1 className="mb-6 text-2xl font-bold text-slate-900">Avis</h1><p className="text-sm text-slate-400">Aucun avis pour ce prestataire.</p></div>;
  }

  let query = supabase.from("avis").select("id, note, avis_texte, badge, publie, masque, created_at, offre_id, offres(titre)", { count: "exact" });
  if (q) query = query.ilike("avis_texte", `%${q}%`);
  if (note) query = query.eq("note", parseInt(note));
  if (offreIdsFiltres) query = query.in("offre_id", offreIdsFiltres);
  if (statut === "masque") query = query.eq("masque", true);
  else if (statut === "publie") query = query.eq("publie", true).eq("masque", false);
  else if (statut === "non_publie") query = query.eq("publie", false);
  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data: avis, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const fmt = (d: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Avis</h1>
      <form method="GET" className="mb-6 flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder="Rechercher dans le contenu…" className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select name="statut" defaultValue={statut ?? ""} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">Tous les statuts</option>
          <option value="publie">Publié</option>
          <option value="masque">Masqué (admin)</option>
          <option value="non_publie">Non publié</option>
        </select>
        <select name="note" defaultValue={note ?? ""} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">Toutes les notes</option>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n}/5)</option>)}
        </select>
        <select name="prestataire" defaultValue={prestataireFiltreId ?? ""} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">Tous les prestataires</option>
          {(prestataires ?? []).map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
        </select>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Filtrer</button>
        {(q || statut || note || prestataireFiltreId) && <Link href="/admin/avis" className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Réinitialiser</Link>}
      </form>
      <p className="mb-3 text-sm text-slate-500">{count ?? 0} avis</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Formation</th><th className="px-4 py-3">Note</th><th className="px-4 py-3">Extrait</th>
              <th className="px-4 py-3">Badge</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(avis ?? []).map((a) => {
              const offre = Array.isArray(a.offres) ? a.offres[0] : a.offres;
              return (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="max-w-40 truncate px-4 py-3 text-slate-700">{offre?.titre ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{"★".repeat(a.note ?? 0)}</td>
                  <td className="max-w-48 px-4 py-3"><p className="truncate text-slate-600">{a.avis_texte?.slice(0, 80) ?? "—"}</p></td>
                  <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{a.badge === "invite" ? "Invité" : (a.badge ?? "—")}</span></td>
                  <td className="px-4 py-3">
                    {a.masque ? <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Masqué admin</span>
                      : !a.publie ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Non publié</span>
                      : <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Publié</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{fmt(a.created_at)}</td>
                  <td className="px-4 py-3"><AvisAdminActions id={a.id} masque={a.masque} avisTexte={a.avis_texte ?? ""} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(avis ?? []).length === 0 && <p className="py-12 text-center text-sm text-slate-400">Aucun avis trouvé.</p>}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <PageLink params={{ q, statut, note, prestataire: prestataireFiltreId }} page={page - 1} disabled={page <= 1} label="← Précédent" />
          <span className="text-sm text-slate-500">Page {page} / {totalPages}</span>
          <PageLink params={{ q, statut, note, prestataire: prestataireFiltreId }} page={page + 1} disabled={page >= totalPages} label="Suivant →" />
        </div>
      )}
    </div>
  );
}

function PageLink({ params, page, disabled, label }: { params: Record<string, string | undefined>; page: number; disabled: boolean; label: string }) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && sp.set(k, v));
  if (page > 1) sp.set("page", String(page));
  return <Link href={`/admin/avis${sp.toString() ? `?${sp}` : ""}`} aria-disabled={disabled} className={`rounded-lg border border-slate-200 px-3 py-2 text-sm ${disabled ? "pointer-events-none opacity-40" : "text-slate-600 hover:bg-slate-50"}`}>{label}</Link>;
}
