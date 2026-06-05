import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/admin";
import { PrestatairesActions } from "./PrestatairesActions";

const PAGE_SIZE = 20;
type SearchParams = { q?: string; plan?: string; statut?: string; sort?: string; page?: string };

export default async function AdminPrestatairesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminUser();
  const supabase = await createClient();
  const { q, plan, statut, sort = "created_at", page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from("prestataires").select("id, nom, email, plan, statut, plan_expire_at, created_at", { count: "exact" });
  if (q) query = query.ilike("nom", `%${q}%`);
  if (plan) query = query.eq("plan", plan);
  if (statut) query = query.eq("statut", statut);
  query = query.order(sort === "nom" ? "nom" : "created_at", { ascending: sort === "nom" }).range(from, to);

  const { data: prestataires, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const fmt = (d: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Prestataires</h1>
      <form method="GET" className="mb-6 flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder="Rechercher nom / email…" className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select name="plan" defaultValue={plan ?? ""} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">Tous les plans</option>
          <option value="freemium">Freemium</option><option value="starter">Starter</option><option value="pro">Pro</option><option value="scale">Scale</option>
        </select>
        <select name="statut" defaultValue={statut ?? ""} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option><option value="suspendu">Suspendu</option><option value="banni">Banni</option>
        </select>
        <select name="sort" defaultValue={sort} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="created_at">Tri : date inscription</option>
          <option value="nom">Tri : nom</option>
        </select>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Filtrer</button>
        {(q || plan || statut) && <Link href="/admin/prestataires" className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Réinitialiser</Link>}
      </form>
      <p className="mb-3 text-sm text-slate-500">{count ?? 0} prestataire(s)</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Nom</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Statut</th><th className="px-4 py-3">Inscription</th><th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(prestataires ?? []).map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">
                  <Link href={`/admin/prestataires/${p.id}`} className="hover:text-blue-600 hover:underline">{p.nom}</Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.email ?? "—"}</td>
                <td className="px-4 py-3"><PlanBadge plan={p.plan} /></td>
                <td className="px-4 py-3"><StatutBadge statut={p.statut} /></td>
                <td className="px-4 py-3 text-slate-500">{fmt(p.created_at)}</td>
                <td className="px-4 py-3"><PrestatairesActions id={p.id} statut={p.statut} plan={p.plan} planExpireAt={p.plan_expire_at} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {(prestataires ?? []).length === 0 && <p className="py-12 text-center text-sm text-slate-400">Aucun prestataire trouvé.</p>}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <PageLink params={{ q, plan, statut, sort }} page={page - 1} disabled={page <= 1} label="← Précédent" />
          <span className="text-sm text-slate-500">Page {page} / {totalPages}</span>
          <PageLink params={{ q, plan, statut, sort }} page={page + 1} disabled={page >= totalPages} label="Suivant →" />
        </div>
      )}
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const c: Record<string, string> = { freemium: "bg-slate-100 text-slate-600", starter: "bg-blue-50 text-blue-700", pro: "bg-violet-50 text-violet-700", scale: "bg-amber-50 text-amber-700" };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c[plan] ?? c.freemium}`}>{plan}</span>;
}
function StatutBadge({ statut }: { statut: string }) {
  const c: Record<string, string> = { actif: "bg-green-50 text-green-700", suspendu: "bg-orange-50 text-orange-700", banni: "bg-red-50 text-red-700" };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c[statut] ?? "bg-slate-100 text-slate-600"}`}>{statut}</span>;
}
function PageLink({ params, page, disabled, label }: { params: Record<string, string | undefined>; page: number; disabled: boolean; label: string }) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && sp.set(k, v));
  if (page > 1) sp.set("page", String(page));
  return <Link href={`/admin/prestataires${sp.toString() ? `?${sp}` : ""}`} aria-disabled={disabled} className={`rounded-lg border border-slate-200 px-3 py-2 text-sm ${disabled ? "pointer-events-none opacity-40" : "text-slate-600 hover:bg-slate-50"}`}>{label}</Link>;
}
