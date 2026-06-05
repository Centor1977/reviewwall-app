import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import { Star, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type Params = { id: string };
type SearchParams = { note?: string; page?: string; tri?: string };

const PAGE_SIZE = 20;

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
};

export default async function AvisOffrePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const { note: noteFilter, page: pageParam, tri = "recent" } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

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

  const vertical = VERTICALS[(prestataire.vertical as Vertical) ?? DEFAULT_VERTICAL];

  const { data: allStats } = await supabase
    .from("avis")
    .select("note, recommande")
    .eq("offre_id", id);

  const totalAll = allStats?.length ?? 0;
  const noteMoyenne =
    totalAll > 0 ? allStats!.reduce((s, a) => s + (a.note ?? 0), 0) / totalAll : null;
  const pctRecommande =
    totalAll > 0
      ? Math.round((allStats!.filter((a) => a.recommande).length / totalAll) * 100)
      : null;

  let query = supabase
    .from("avis")
    .select(
      "id, note, recommande, avis_texte, point_fort, point_amelioration, profil, badge, created_at",
      { count: "exact" }
    )
    .eq("offre_id", id);

  if (noteFilter) query = query.eq("note", parseInt(noteFilter, 10));

  const ascending = tri === "note_asc";
  const col = tri === "note_asc" || tri === "note_desc" ? "note" : "created_at";
  query = (query as typeof query).order(col, { ascending }).range(from, to);

  const { data: avisRows, count } = await query;
  const avis = (avisRows ?? []) as unknown as AvisRow[];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function pageUrl(p: number) {
    const sp = new URLSearchParams();
    if (noteFilter) sp.set("note", noteFilter);
    if (tri !== "recent") sp.set("tri", tri);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/offres/${id}/avis${qs ? `?${qs}` : ""}`;
  }

  function filterUrl(overrides: Record<string, string>) {
    const sp = new URLSearchParams();
    const merged = { note: noteFilter ?? "", tri, ...overrides };
    if (merged.note) sp.set("note", merged.note);
    if (merged.tri && merged.tri !== "recent") sp.set("tri", merged.tri);
    const qs = sp.toString();
    return `/offres/${id}/avis${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="max-w-3xl">
      <nav className="mb-4 text-sm text-slate-400">
        <Link href="/offres" className="transition hover:text-slate-600">Mes formations</Link>
        <span className="mx-1">›</span>
        <Link href={`/offres/${id}`} className="transition hover:text-slate-600">{offre.titre}</Link>
        <span className="mx-1">›</span>
        <span className="text-slate-600">Avis</span>
      </nav>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Avis — {offre.titre}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {noteMoyenne !== null && (
              <span className="flex items-center gap-1.5 text-sm text-slate-600">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <strong>{noteMoyenne.toFixed(1)}</strong>/5
              </span>
            )}
            <span className="text-sm text-slate-600">
              <strong>{totalAll}</strong> avis
            </span>
            {pctRecommande !== null && (
              <span className="text-sm text-slate-600">
                <strong>{pctRecommande}%</strong> recommandent
              </span>
            )}
          </div>
        </div>
        <a
          href={`/api/offres/${id}/avis/export`}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <Download size={13} />
          Export CSV
        </a>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="mr-1 self-center text-xs font-medium text-slate-500">Note :</span>
          {(["", "5", "4", "3", "2", "1"] as const).map((n) => (
            <Link
              key={n}
              href={filterUrl({ note: n })}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs transition",
                (n === "" ? !noteFilter : noteFilter === n)
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {n === "" ? "Toutes" : `${n}★`}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex gap-1">
          {[
            { key: "recent", label: "Plus récents" },
            { key: "note_asc", label: "Note ↑" },
            { key: "note_desc", label: "Note ↓" },
          ].map((t) => (
            <Link
              key={t.key}
              href={filterUrl({ tri: t.key })}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs transition",
                tri === t.key
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-500">{count ?? 0} avis</p>

      {avis.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <Star size={28} className="mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">Aucun avis</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {avis.map((a) => (
              <AvisCard key={a.id} avis={a} vertical={vertical} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <Link
                href={pageUrl(page - 1)}
                aria-disabled={page <= 1}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition",
                  page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-50"
                )}
              >
                <ChevronLeft size={15} /> Précédent
              </Link>
              <span className="text-sm text-slate-500">
                Page {page} / {totalPages}
              </span>
              <Link
                href={pageUrl(page + 1)}
                aria-disabled={page >= totalPages}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition",
                  page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-slate-50"
                )}
              >
                Suivant <ChevronRight size={15} />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AvisCard({
  avis: a,
  vertical,
}: {
  avis: AvisRow;
  vertical: (typeof VERTICALS)[keyof typeof VERTICALS];
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
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={13}
                className={
                  i <= (a.note ?? 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-none text-slate-200"
                }
              />
            ))}
          </div>
          {a.recommande !== null && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                a.recommande ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              )}
            >
              {a.recommande ? "Recommande" : "Ne recommande pas"}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">{date}</span>
      </div>

      {profilChips.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {profilChips.map(({ label, value }) => (
            <span
              key={label}
              title={label}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600"
            >
              {value}
            </span>
          ))}
        </div>
      )}

      {a.avis_texte && (
        <p className="mb-3 text-sm leading-relaxed text-slate-700">{a.avis_texte}</p>
      )}

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

      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
        {a.badge === "invite" ? "Avis invité" : (a.badge ?? "—")}
      </span>
    </div>
  );
}
