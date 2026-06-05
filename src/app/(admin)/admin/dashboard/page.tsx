import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/admin";
import { Users, Star, BookOpen, Flag, UserPlus, AlertTriangle } from "lucide-react";

export default async function AdminDashboardPage() {
  await requireAdminUser();
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: totalPrestataires },
    { count: totalApprenants },
    { count: totalAvis },
    { count: totalOffres },
    { count: signalementsEnAttente },
    { count: nouveauxAujourdhui },
    { data: dernieresInscriptions },
    { data: derniersAvis },
    { data: alertesSignalements },
    { data: suspendusRecents },
  ] = await Promise.all([
    supabase.from("prestataires").select("*", { count: "exact", head: true }).eq("statut", "actif"),
    supabase.from("apprenants").select("*", { count: "exact", head: true }),
    supabase.from("avis").select("*", { count: "exact", head: true }).eq("publie", true).eq("masque", false),
    supabase.from("offres").select("*", { count: "exact", head: true }).eq("catalogue_visible", true).eq("active", true),
    supabase.from("signalements").select("*", { count: "exact", head: true }).eq("statut", "en_attente"),
    supabase.from("prestataires").select("*", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    supabase.from("prestataires").select("id, nom, email, plan, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("avis").select("id, note, badge, created_at, offre_id, offres(titre)").order("created_at", { ascending: false }).limit(5),
    supabase.from("signalements").select("id, raison, created_at, avis_id").eq("statut", "en_attente").order("created_at", { ascending: false }).limit(5),
    supabase.from("prestataires").select("id, nom, statut, created_at").eq("statut", "suspendu").order("created_at", { ascending: false }).limit(3),
  ]);

  const fmt = (d: string) =>
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Tableau de bord</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<Users size={18} className="text-blue-600" />} label="Prestataires actifs" value={String(totalPrestataires ?? 0)} bg="bg-blue-50" />
        <StatCard icon={<Users size={18} className="text-violet-600" />} label="Apprenants inscrits" value={String(totalApprenants ?? 0)} bg="bg-violet-50" />
        <StatCard icon={<Star size={18} className="text-yellow-500" />} label="Avis publiés" value={String(totalAvis ?? 0)} bg="bg-yellow-50" />
        <StatCard icon={<BookOpen size={18} className="text-green-600" />} label="Offres au catalogue" value={String(totalOffres ?? 0)} bg="bg-green-50" />
        <StatCard
          icon={<Flag size={18} className={(signalementsEnAttente ?? 0) > 0 ? "text-red-600" : "text-slate-400"} />}
          label="Signalements en attente" value={String(signalementsEnAttente ?? 0)}
          bg={(signalementsEnAttente ?? 0) > 0 ? "bg-red-50" : "bg-slate-50"}
          href="/admin/signalements" alert={(signalementsEnAttente ?? 0) > 0}
        />
        <StatCard icon={<UserPlus size={18} className="text-teal-600" />} label="Nouveaux inscrits aujourd'hui" value={String(nouveauxAujourdhui ?? 0)} bg="bg-teal-50" />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Dernières inscriptions</h2>
            <Link href="/admin/prestataires" className="text-xs text-blue-600 hover:underline">Voir tous</Link>
          </div>
          {(dernieresInscriptions ?? []).length === 0 ? (
            <p className="text-sm text-slate-400">Aucune inscription.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {(dernieresInscriptions ?? []).map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.nom}</p>
                    <p className="text-xs text-slate-400">{p.email}</p>
                  </div>
                  <div className="text-right">
                    <PlanBadge plan={p.plan} />
                    <p className="mt-0.5 text-xs text-slate-400">{fmt(p.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Derniers avis</h2>
            <Link href="/admin/avis" className="text-xs text-blue-600 hover:underline">Voir tous</Link>
          </div>
          {(derniersAvis ?? []).length === 0 ? (
            <p className="text-sm text-slate-400">Aucun avis.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {(derniersAvis ?? []).map((a) => {
                const offre = Array.isArray(a.offres) ? a.offres[0] : a.offres;
                return (
                  <li key={a.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm text-slate-700">{offre?.titre ?? "—"}</p>
                      <span className="text-xs text-slate-400">{a.badge === "invite" ? "Avis invité" : (a.badge ?? "—")}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">{"★".repeat(a.note ?? 0)}</p>
                      <p className="text-xs text-slate-400">{fmt(a.created_at)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {((signalementsEnAttente ?? 0) > 0 || (suspendusRecents ?? []).length > 0) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700">
            <AlertTriangle size={16} /> Alertes
          </h2>
          {(signalementsEnAttente ?? 0) > 0 && (
            <div className="mb-3">
              <p className="text-sm text-red-700"><strong>{signalementsEnAttente}</strong> signalement(s) en attente.</p>
              <ul className="mt-2 space-y-1">
                {(alertesSignalements ?? []).map((s) => (
                  <li key={s.id} className="text-xs text-red-600">→ Raison : <strong>{s.raison}</strong> — {fmt(s.created_at)}</li>
                ))}
              </ul>
              <Link href="/admin/signalements" className="mt-2 inline-block text-xs font-semibold text-red-700 underline">Traiter les signalements</Link>
            </div>
          )}
          {(suspendusRecents ?? []).length > 0 && (
            <div>
              <p className="text-sm text-red-700">Prestataires récemment suspendus :</p>
              <ul className="mt-1 space-y-0.5">
                {(suspendusRecents ?? []).map((p) => (
                  <li key={p.id} className="text-xs text-red-600">→ {p.nom}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bg, href, alert }: { icon: React.ReactNode; label: string; value: string; bg: string; href?: string; alert?: boolean }) {
  const inner = (
    <div className={`rounded-xl border ${alert ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"} p-4`}>
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>{icon}</div>
      <p className={`text-2xl font-bold ${alert ? "text-red-700" : "text-slate-900"}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
  if (href) return <Link href={href} className="block transition-opacity hover:opacity-80">{inner}</Link>;
  return inner;
}

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = { freemium: "bg-slate-100 text-slate-600", starter: "bg-blue-50 text-blue-700", pro: "bg-violet-50 text-violet-700", scale: "bg-amber-50 text-amber-700" };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[plan] ?? colors.freemium}`}>{plan}</span>;
}
