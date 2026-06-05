import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import { cn } from "@/lib/utils";
import {
  Star,
  ThumbsUp,
  BarChart3,
  Link2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AvisFilter } from "./AvisFilter";

const PAGE_SIZE = 10;

type SearchParams = { offre?: string; page?: string };

type AvisRow = {
  id: string;
  note: number | null;
  recommande: boolean | null;
  avis_texte: string | null;
  point_fort: string | null;
  point_amelioration: string | null;
  profil: Record<string, string> | null;
  badge: string | null;
  created_at: string;
  offre_id: string;
  offres: { id: string; titre: string } | null;
};

export default async function AvisPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { offre: offreFilter, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const prestataire = await ensurePrestataire(supabase, user!.id);
  const vertical =
    VERTICALS[(prestataire?.vertical as Vertical) ?? DEFAULT_VERTICAL];

  // Offres for filter dropdown
  const { data: offres } = await supabase
    .from("offres")
    .select("id, titre")
    .eq("prestataire_id", prestataire!.id)
    .order("titre");

  const allOffreIds = (offres ?? []).map((o) => o.id);

  // Empty state — no offres at all
  if (allOffreIds.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Mes avis</h1>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <Star size={32} className="mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">
            Vous n&apos;avez pas encore reçu d&apos;avis
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Créez une {vertical.offre.singular} puis générez vos premiers liens
            de collecte.
          </p>
          <Link
            href="/offres/nouvelle"
            className="mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700"
          >
            <Link2 size={15} />
            Créer une {vertical.offre.singular}
          </Link>
        </div>
      </div>
    );
  }

  // ── Global stats (all avis, ignores filter) ─────────────────────────────
  const { data: allAvis } = await supabase
    .from("avis")
    .select("note, recommande")
    .in("offre_id", allOffreIds);

  const totalAvis = allAvis?.length ?? 0;
  const noteMoyenne =
    totalAvis > 0
      ? allAvis!.reduce((s, a) => s + (a.note ?? 0), 0) / totalAvis
      : null;
  const pctRecommande =
    totalAvis > 0
      ? Math.round(
          (allAvis!.filter((a) => a.recommande).length / totalAvis) * 100
        )
      : null;

  // ── Filtered + paginated avis ───────────────────────────────────────────
  const filteredIds = offreFilter ? [offreFilter] : allOffreIds;

  const { count } = await supabase
    .from("avis")
    .select("*", { count: "exact", head: true })
    .in("offre_id", filteredIds);

  const { data: avisRows } = await supabase
    .from("avis")
    .select(
      "id, note, recommande, avis_texte, point_fort, point_amelioration, profil, badge, created_at, offre_id, offres(id, titre)"
    )
    .in("offre_id", filteredIds)
    .order("created_at", { ascending: false })
    .range(from, to);

  const avis = (avisRows ?? []) as unknown as AvisRow[];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  // Réponses aux questions pour les avis affichés
  type ReponseRow = { id: string; avis_id: string; reponse_texte: string | null; reponse_note: number | null; reponse_booleen: boolean | null; reponse_choix: string[] | null; question: { texte: string; visibilite_defaut: string } | null };
  const avisIds = avis.map((a) => a.id);
  const { data: reponsesRaw } = avisIds.length > 0
    ? await supabase
        .from("question_reponses")
        .select("id, avis_id, reponse_texte, reponse_note, reponse_booleen, reponse_choix, question:questions_bibliotheque(texte, visibilite_defaut)")
        .in("avis_id", avisIds)
    : { data: [] as ReponseRow[] };

  const reponsesByAvis = (reponsesRaw ?? []).reduce<Record<string, ReponseRow[]>>((acc, r) => {
    if (!acc[r.avis_id]) acc[r.avis_id] = [];
    acc[r.avis_id].push(r as ReponseRow);
    return acc;
  }, {});

  // Pagination URL helper
  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (offreFilter) params.set("offre", offreFilter);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/avis${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Mes avis</h1>
        <AvisFilter offres={offres ?? []} current={offreFilter} />
      </div>

      {/* Global stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Star size={18} className="text-blue-600" />}
          label="Note moyenne"
          value={noteMoyenne !== null ? noteMoyenne.toFixed(1) + " / 5" : "—"}
        />
        <StatCard
          icon={<BarChart3 size={18} className="text-blue-600" />}
          label="Total avis"
          value={String(totalAvis)}
        />
        <StatCard
          icon={<ThumbsUp size={18} className="text-blue-600" />}
          label="Recommandation"
          value={pctRecommande !== null ? `${pctRecommande}%` : "—"}
        />
      </div>

      {/* Results info */}
      <p className="mb-4 text-sm text-slate-500">
        {count ?? 0} avis
        {offreFilter && offres && (
          <span className="ml-1 text-slate-400">
            — {offres.find((o) => o.id === offreFilter)?.titre}
          </span>
        )}
      </p>

      {/* Empty filtered state */}
      {avis.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <Star size={28} className="mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">
            Vous n&apos;avez pas encore reçu d&apos;avis
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Générez un lien de collecte depuis la page d&apos;une{" "}
            {vertical.offre.singular}.
          </p>
          <Link
            href="/offres"
            className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700"
          >
            <Link2 size={14} />
            Générer un lien de collecte
          </Link>
        </div>
      ) : (
        <>
          {/* Avis list */}
          <div className="space-y-4">
            {avis.map((a) => (
              <AvisCard key={a.id} a={a} vertical={vertical} reponses={reponsesByAvis[a.id] ?? []} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <Link
                href={pageUrl(page - 1)}
                aria-disabled={page <= 1}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors duration-150",
                  page <= 1
                    ? "pointer-events-none opacity-40"
                    : "hover:bg-slate-50"
                )}
              >
                <ChevronLeft size={15} />
                Précédent
              </Link>

              <span className="text-sm text-slate-500">
                Page {page} / {totalPages}
              </span>

              <Link
                href={pageUrl(page + 1)}
                aria-disabled={page >= totalPages}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors duration-150",
                  page >= totalPages
                    ? "pointer-events-none opacity-40"
                    : "hover:bg-slate-50"
                )}
              >
                Suivant
                <ChevronRight size={15} />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
        {icon}
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}

// ── AvisCard ──────────────────────────────────────────────────────────────

type ReponseRow = { id: string; avis_id: string; reponse_texte: string | null; reponse_note: number | null; reponse_booleen: boolean | null; reponse_choix: string[] | null; question: { texte: string; visibilite_defaut: string } | null };

function AvisCard({
  a,
  vertical,
  reponses,
}: {
  a: AvisRow;
  vertical: (typeof VERTICALS)[keyof typeof VERTICALS];
  reponses: ReponseRow[];
}) {
  const date = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(a.created_at));

  const profilChips = vertical.profil_fields
    .map((f) => ({ label: f.label, value: (a.profil ?? {})[f.key] }))
    .filter((e) => e.value);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      {/* Header row */}
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Stars */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={14}
                className={
                  i <= (a.note ?? 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-none text-slate-200"
                }
              />
            ))}
          </div>
          {/* Recommande */}
          {a.recommande !== null && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                a.recommande
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              )}
            >
              {a.recommande ? "Recommande" : "Ne recommande pas"}
            </span>
          )}
        </div>

        {/* Offre + date */}
        <div className="text-right text-xs text-slate-400">
          {a.offres?.titre && (
            <p className="font-medium text-slate-600">{a.offres.titre}</p>
          )}
          <p>{date}</p>
        </div>
      </div>

      {/* Profil chips */}
      {profilChips.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {profilChips.map(({ label, value }) => (
            <span
              key={label}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600"
              title={label}
            >
              {value}
            </span>
          ))}
        </div>
      )}

      {/* Texte */}
      {a.avis_texte && (
        <p className="mb-3 text-sm leading-relaxed text-slate-700">
          {a.avis_texte}
        </p>
      )}

      {/* Points */}
      {(a.point_fort || a.point_amelioration) && (
        <div className="mb-3 space-y-1 rounded-lg bg-slate-50 px-3 py-2.5 text-xs">
          {a.point_fort && (
            <div className="flex items-start gap-1.5">
              <span className="mt-px font-bold text-green-600">+</span>
              <span className="text-slate-700">{a.point_fort}</span>
            </div>
          )}
          {a.point_amelioration && (
            <div className="flex items-start gap-1.5">
              <span className="mt-px font-bold text-amber-500">~</span>
              <span className="text-slate-700">{a.point_amelioration}</span>
            </div>
          )}
        </div>
      )}

      {/* Badge */}
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
        {a.badge === "invite" ? "Avis invité" : (a.badge ?? "—")}
      </span>

      {/* Accordéon réponses */}
      {reponses.length > 0 && (
        <details className="mt-3 border-t border-slate-100 pt-3">
          <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700 select-none">
            Réponses aux questions ({reponses.length})
          </summary>
          <div className="mt-2 space-y-3">
            {["publique", "privee"].map((vis) => {
              const group = reponses.filter((r) => r.question?.visibilite_defaut === vis);
              if (!group.length) return null;
              return (
                <div key={vis}>
                  <p className="mb-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {vis === "publique" ? "Questions publiques" : "🔒 Questions privées"}
                  </p>
                  <div className="space-y-1">
                    {group.map((r) => {
                      const rep = r.reponse_texte ?? r.reponse_choix?.join(", ")
                        ?? (r.reponse_booleen != null ? (r.reponse_booleen ? "Oui" : "Non") : null)
                        ?? (r.reponse_note != null ? `${r.reponse_note}/5` : "—");
                      return (
                        <div key={r.id} className="flex gap-2 text-xs text-slate-600">
                          <span className="shrink-0 text-slate-400">›</span>
                          <span>{r.question?.texte} <span className="font-medium text-slate-800">→ {rep}</span></span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
