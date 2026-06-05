import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/admin";

const PAGE_SIZE = 30;
const ACTION_LABELS: Record<string, string> = {
  suspend_prestataire: "Suspension prestataire", unsuspend_prestataire: "Réactivation prestataire",
  ban_prestataire: "Bannissement prestataire", change_plan: "Changement de plan",
  mask_avis: "Masquage avis", restore_avis: "Restauration avis", delete_avis: "Suppression avis",
  force_unpublish_offre: "Dépublication offre", treat_signalement: "Traitement signalement", reject_signalement: "Rejet signalement",
};

type SearchParams = { action?: string; page?: string };

export default async function AdminLogsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminUser();
  const supabase = await createClient();
  const { action, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase.from("admin_logs").select("id, action, cible_type, cible_id, detail, created_at", { count: "exact" }).order("created_at", { ascending: false });
  if (action) query = query.eq("action", action);
  query = query.range(from, to);
  const { data: logs, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const fmt = (d: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
  const cibleLinks: Record<string, (id: string) => string> = {
    prestataire: (id) => `/admin/prestataires/${id}`,
    avis: () => `/admin/avis`,
    offre: () => `/admin/offres`,
    signalement: () => `/admin/signalements`,
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Logs admin</h1>
        <p className="text-sm text-slate-400">Journal en lecture seule</p>
      </div>
      <form method="GET" className="mb-6 flex gap-3">
        <select name="action" defaultValue={action ?? ""} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">Toutes les actions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Filtrer</button>
        {action && <Link href="/admin/logs" className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Réinitialiser</Link>}
      </form>
      <p className="mb-3 text-sm text-slate-500">{count ?? 0} entrée(s)</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Date</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Cible</th><th className="px-4 py-3">Détail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(logs ?? []).map((l) => {
              const href = cibleLinks[l.cible_type]?.(l.cible_id);
              return (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{fmt(l.created_at)}</td>
                  <td className="px-4 py-3"><span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">{l.action}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <span className="text-slate-400">{l.cible_type} / </span>
                    {href ? <Link href={href} className="font-mono text-blue-600 hover:underline">{l.cible_id.slice(0, 8)}…</Link> : <span className="font-mono">{l.cible_id.slice(0, 8)}…</span>}
                  </td>
                  <td className="max-w-64 truncate px-4 py-3 text-xs text-slate-500">
                    {l.detail && Object.keys(l.detail).length > 0 ? JSON.stringify(l.detail) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(logs ?? []).length === 0 && <p className="py-12 text-center text-sm text-slate-400">Aucun log.</p>}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <PageLink params={{ action }} page={page - 1} disabled={page <= 1} label="← Précédent" />
          <span className="text-sm text-slate-500">Page {page} / {totalPages}</span>
          <PageLink params={{ action }} page={page + 1} disabled={page >= totalPages} label="Suivant →" />
        </div>
      )}
    </div>
  );
}

function PageLink({ params, page, disabled, label }: { params: Record<string, string | undefined>; page: number; disabled: boolean; label: string }) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && sp.set(k, v));
  if (page > 1) sp.set("page", String(page));
  return <Link href={`/admin/logs${sp.toString() ? `?${sp}` : ""}`} aria-disabled={disabled} className={`rounded-lg border border-slate-200 px-3 py-2 text-sm ${disabled ? "pointer-events-none opacity-40" : "text-slate-600 hover:bg-slate-50"}`}>{label}</Link>;
}
