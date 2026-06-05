import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/admin";
import { OffresAdminActions } from "./OffresAdminActions";

const PAGE_SIZE = 20;
type SearchParams = { q?: string; page?: string };

export default async function AdminOffresPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminUser();
  const supabase = await createClient();
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from("offres").select("id, titre, catalogue_visible, catalogue_force, active, created_at, slug, prestataires(nom)", { count: "exact" }).order("created_at", { ascending: false });
  if (q) query = query.ilike("titre", `%${q}%`);
  query = query.range(from, to);
  const { data: offres, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const offreIds = (offres ?? []).map((o) => o.id);
  const { data: avisData } = offreIds.length > 0
    ? await supabase.from("avis").select("offre_id, note").in("offre_id", offreIds).eq("publie", true).eq("masque", false)
    : { data: [] };
  const avisParOffre = (avisData ?? []).reduce<Record<string, { count: number; notes: number[] }>>((acc, a) => {
    if (!acc[a.offre_id]) acc[a.offre_id] = { count: 0, notes: [] };
    acc[a.offre_id].count++;
    if (a.note) acc[a.offre_id].notes.push(a.note);
    return acc;
  }, {});

  const fmt = (d: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Offres</h1>
      <form method="GET" className="mb-6 flex gap-3">
        <input name="q" defaultValue={q} placeholder="Rechercher par titre…" className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Filtrer</button>
        {q && <Link href="/admin/offres" className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Réinitialiser</Link>}
      </form>
      <p className="mb-3 text-sm text-slate-500">{count ?? 0} offres</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Titre</th><th className="px-4 py-3">Prestataire</th><th className="px-4 py-3">Catalogue</th>
              <th className="px-4 py-3">Nb avis</th><th className="px-4 py-3">Note</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(offres ?? []).map((o) => {
              const presta = Array.isArray(o.prestataires) ? o.prestataires[0] : o.prestataires;
              const stats = avisParOffre[o.id];
              const noteMoy = stats?.notes.length ? (stats.notes.reduce((a, b) => a + b, 0) / stats.notes.length).toFixed(1) : null;
              return (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="max-w-48 truncate px-4 py-3 font-medium text-slate-800">{o.titre}</td>
                  <td className="px-4 py-3 text-slate-600">{presta?.nom ?? "—"}</td>
                  <td className="px-4 py-3">
                    {o.catalogue_visible
                      ? <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Visible{o.catalogue_force && " 🔒"}</span>
                      : <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Masquée</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{stats?.count ?? 0}</td>
                  <td className="px-4 py-3 text-slate-700">{noteMoy ? `${noteMoy}/5` : "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{fmt(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Link href={`/f/${o.slug}`} target="_blank" className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">Fiche ↗</Link>
                      {o.catalogue_visible && <OffresAdminActions id={o.id} catalogueForce={o.catalogue_force} />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(offres ?? []).length === 0 && <p className="py-12 text-center text-sm text-slate-400">Aucune offre trouvée.</p>}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <PageLink params={{ q }} page={page - 1} disabled={page <= 1} label="← Précédent" />
          <span className="text-sm text-slate-500">Page {page} / {totalPages}</span>
          <PageLink params={{ q }} page={page + 1} disabled={page >= totalPages} label="Suivant →" />
        </div>
      )}
    </div>
  );
}

function PageLink({ params, page, disabled, label }: { params: Record<string, string | undefined>; page: number; disabled: boolean; label: string }) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && sp.set(k, v));
  if (page > 1) sp.set("page", String(page));
  return <Link href={`/admin/offres${sp.toString() ? `?${sp}` : ""}`} aria-disabled={disabled} className={`rounded-lg border border-slate-200 px-3 py-2 text-sm ${disabled ? "pointer-events-none opacity-40" : "text-slate-600 hover:bg-slate-50"}`}>{label}</Link>;
}
