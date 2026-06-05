import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { Plus, Users, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Params = { id: string };

type SeanceRow = {
  id: string;
  titre: string;
  mode: string;
  date_session: string | null;
  lieu: string | null;
  statut: string;
  nb_participants_attendus: number | null;
  participants: { statut_avis: string }[];
};

const MODE_CONFIG: Record<string, { label: string; cls: string }> = {
  presentiel: { label: "Présentiel", cls: "bg-blue-50 text-blue-700" },
  distance: { label: "À distance", cls: "bg-violet-50 text-violet-700" },
  video: { label: "Vidéo", cls: "bg-emerald-50 text-emerald-700" },
};

const STATUT_DOT: Record<string, string> = {
  active: "bg-green-500",
  en_cours: "bg-amber-500",
  ouverte: "bg-blue-500",
  cloturee: "bg-slate-400",
  archivee: "bg-slate-300",
};

const STATUT_BADGE: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  en_cours: "bg-amber-50 text-amber-700",
  ouverte: "bg-blue-50 text-blue-700",
  cloturee: "bg-slate-100 text-slate-500",
  archivee: "bg-slate-100 text-slate-400",
};

const STATUT_LABEL: Record<string, string> = {
  active: "Active",
  en_cours: "En cours",
  ouverte: "Ouverte",
  cloturee: "Clôturée",
  archivee: "Archivée",
};

function formatDate(d: string | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(d));
}

type Filter = "toutes" | "actives" | "cloturees" | "archivees";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "toutes", label: "Toutes" },
  { key: "actives", label: "Actives" },
  { key: "cloturees", label: "Clôturées" },
  { key: "archivees", label: "Archivées" },
];

export default async function ListeSeancesPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ filtre?: string }>;
}) {
  const { id } = await params;
  const { filtre = "toutes" } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const prestataire = await ensurePrestataire(supabase, user!.id);
  if (!prestataire) notFound();

  const { data: offre } = await supabase
    .from("offres")
    .select("id, titre")
    .eq("id", id)
    .eq("prestataire_id", prestataire.id)
    .maybeSingle();

  if (!offre) notFound();

  const { data: seancesRaw } = await supabase
    .from("seances")
    .select("id, titre, mode, date_session, lieu, statut, nb_participants_attendus, participants(statut_avis)")
    .eq("offre_id", id)
    .order("created_at", { ascending: false });

  const all = (seancesRaw ?? []) as unknown as SeanceRow[];

  const seances =
    filtre === "actives"
      ? all.filter((s) => ["active", "en_cours", "ouverte"].includes(s.statut))
      : filtre === "cloturees"
        ? all.filter((s) => s.statut === "cloturee")
        : filtre === "archivees"
          ? all.filter((s) => s.statut === "archivee")
          : all;

  return (
    <div className="max-w-3xl">
      <nav className="mb-4 text-sm text-slate-400">
        <Link href="/offres" className="transition hover:text-slate-600">Mes formations</Link>
        <span className="mx-1">›</span>
        <Link href={`/offres/${id}`} className="transition hover:text-slate-600">{offre.titre}</Link>
        <span className="mx-1">›</span>
        <span className="text-slate-600">Séances</span>
      </nav>

      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-900">Séances — {offre.titre}</h1>
        <Link
          href={`/offres/${id}/seances/nouvelle`}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={14} />
          Nouvelle séance
        </Link>
      </div>

      <div className="mb-4 flex gap-1.5">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={
              f.key === "toutes"
                ? `/offres/${id}/seances`
                : `/offres/${id}/seances?filtre=${f.key}`
            }
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              filtre === f.key
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {seances.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <Users size={28} className="mb-3 text-slate-300" />
          <p className="mb-4 text-sm font-medium text-slate-700">Aucune séance</p>
          <Link
            href={`/offres/${id}/seances/nouvelle`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Créer une séance
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {seances.map((s) => {
            const modeConf = MODE_CONFIG[s.mode] ?? MODE_CONFIG.presentiel;
            const dotColor = STATUT_DOT[s.statut] ?? "bg-slate-400";
            const badgeCls = STATUT_BADGE[s.statut] ?? "bg-slate-100 text-slate-500";
            const nbP = s.participants.length;
            const nbA = s.participants.filter((p) => p.statut_avis === "soumis").length;
            const pct = nbP > 0 ? Math.round((nbA / nbP) * 100) : 0;

            return (
              <div key={s.id} className="flex items-center gap-4 p-4">
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dotColor)} />

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">{s.titre}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", modeConf.cls)}>
                      {modeConf.label}
                    </span>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", badgeCls)}>
                      {STATUT_LABEL[s.statut] ?? s.statut}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    {s.date_session && <span>{formatDate(s.date_session)}</span>}
                    {s.lieu && <span>{s.lieu}</span>}
                    <span className="flex items-center gap-1">
                      <Users size={10} />
                      {nbP} participant{nbP !== 1 ? "s" : ""}
                      {s.nb_participants_attendus ? ` / ${s.nb_participants_attendus}` : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      {nbA > 0 ? (
                        <CheckCircle2 size={10} className="text-green-500" />
                      ) : (
                        <Clock size={10} />
                      )}
                      {nbA} avis · {pct}%
                    </span>
                  </div>
                  {nbP > 0 && (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>

                <Link
                  href={`/offres/${id}/seances/${s.id}`}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Gérer
                  <ChevronRight size={12} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
