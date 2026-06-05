import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/admin";
import { PrestatairesActions } from "../PrestatairesActions";

export default async function AdminPrestatairesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminUser();
  const { id } = await params;
  const supabase = await createClient();

  const { data: p } = await supabase.from("prestataires").select("id, nom, email, plan, plan_expire_at, statut, vertical, organisme, created_at").eq("id", id).maybeSingle();
  if (!p) notFound();

  const [{ data: offres }, { data: logs }] = await Promise.all([
    supabase.from("offres").select("id, titre, active, catalogue_visible, created_at").eq("prestataire_id", id).order("created_at", { ascending: false }),
    supabase.from("admin_logs").select("id, action, detail, created_at").eq("cible_type", "prestataire").eq("cible_id", id).order("created_at", { ascending: false }).limit(20),
  ]);

  const offreIds = (offres ?? []).map((o) => o.id);
  const { data: avis } = offreIds.length > 0
    ? await supabase.from("avis").select("id, note, badge, created_at, masque, publie, offre_id, offres(titre)").in("offre_id", offreIds).order("created_at", { ascending: false }).limit(20)
    : { data: [] };

  const fmt = (d: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/prestataires" className="text-sm text-slate-500 hover:text-slate-700">← Prestataires</Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-800">{p.nom}</span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{p.nom}</h1>
            {p.organisme && <p className="text-sm text-slate-500">{p.organisme}</p>}
          </div>
          <div className="flex gap-2">
            <StatutBadge statut={p.statut} />
            <PlanBadge plan={p.plan} />
          </div>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-slate-400">Email</dt><dd className="text-slate-800">{p.email ?? "—"}</dd></div>
          <div><dt className="text-xs text-slate-400">Vertical</dt><dd className="text-slate-800">{p.vertical}</dd></div>
          <div><dt className="text-xs text-slate-400">Inscription</dt><dd className="text-slate-800">{fmt(p.created_at)}</dd></div>
          {p.plan_expire_at && <div><dt className="text-xs text-slate-400">Expiration plan</dt><dd className="text-slate-800">{fmt(p.plan_expire_at)}</dd></div>}
        </dl>
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</p>
          <PrestatairesActions id={p.id} statut={p.statut} plan={p.plan} planExpireAt={p.plan_expire_at} />
        </div>
      </div>

      <Section title={`Offres (${offres?.length ?? 0})`}>
        {(offres ?? []).length === 0 ? <p className="px-5 py-8 text-sm text-slate-400">Aucune offre.</p> : (
          <ul className="divide-y divide-slate-100">
            {(offres ?? []).map((o) => (
              <li key={o.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div><p className="font-medium text-slate-800">{o.titre}</p><p className="text-xs text-slate-400">{fmt(o.created_at)}</p></div>
                <div className="flex gap-1.5">
                  {o.catalogue_visible && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">Catalogue</span>}
                  {!o.active && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">Inactif</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Avis reçus (${avis?.length ?? 0})`}>
        {(avis ?? []).length === 0 ? <p className="px-5 py-8 text-sm text-slate-400">Aucun avis.</p> : (
          <ul className="divide-y divide-slate-100">
            {(avis ?? []).map((a) => {
              const offre = Array.isArray(a.offres) ? a.offres[0] : a.offres;
              return (
                <li key={a.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div><p className="text-slate-700">{offre?.titre ?? "—"}</p><p className="text-xs text-slate-400">{fmt(a.created_at)}</p></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{"★".repeat(a.note ?? 0)}</span>
                    {a.masque && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">Masqué</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Historique admin">
        {(logs ?? []).length === 0 ? <p className="px-5 py-8 text-sm text-slate-400">Aucune action admin.</p> : (
          <ul className="divide-y divide-slate-100">
            {(logs ?? []).map((l) => (
              <li key={l.id} className="px-5 py-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs font-medium text-slate-700">{l.action}</span>
                    {l.detail && Object.keys(l.detail).length > 0 && <p className="text-xs text-slate-400">{JSON.stringify(l.detail)}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{fmt(l.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function StatutBadge({ statut }: { statut: string }) {
  const c: Record<string, string> = { actif: "bg-green-50 text-green-700", suspendu: "bg-orange-50 text-orange-700", banni: "bg-red-50 text-red-700" };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c[statut] ?? "bg-slate-100 text-slate-600"}`}>{statut}</span>;
}
function PlanBadge({ plan }: { plan: string }) {
  const c: Record<string, string> = { freemium: "bg-slate-100 text-slate-600", starter: "bg-blue-50 text-blue-700", pro: "bg-violet-50 text-violet-700", scale: "bg-amber-50 text-amber-700" };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c[plan] ?? c.freemium}`}>{plan}</span>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-semibold text-slate-700">{title}</h2></div>
      {children}
    </div>
  );
}
