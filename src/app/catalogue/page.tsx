import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Star, Clock, MapPin, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { appConfig } from "@/config/app";
import { cn } from "@/lib/utils";
import { CatalogueFilters } from "./CatalogueFilters";
import type { OffreCatalogue } from "@/app/api/catalogue/route";

export const revalidate = 3600;

const CATALOGUE_PUBLIC = process.env.CATALOGUE_PUBLIC === "true";

const PAGE_SIZE = 12;

const NIVEAU_LABELS: Record<string, string> = {
  tous_niveaux: "Tous niveaux", debutant: "Débutant",
  intermediaire: "Intermédiaire", avance: "Avancé",
};
const FORMAT_LABELS: Record<string, string> = {
  presentiel: "Présentiel", distanciel: "Distanciel",
  blended: "Blended", video: "Vidéo", mixte: "Mixte",
};

// ── Metadata ───────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  if (!CATALOGUE_PUBLIC) {
    return {
      title: `Catalogue — ${appConfig.name}`,
      robots: { index: false, follow: false },
    };
  }
  const title = `Catalogue formations — ${appConfig.name}`;
  const description = `Découvrez des formations évaluées par de vrais apprenants sur ${appConfig.name}. Avis profilés et vérifiés.`;
  return {
    title, description,
    openGraph: { title, description, siteName: appConfig.name },
  };
}

// ── Supabase public client ─────────────────────────────────────

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// ── Data fetching ──────────────────────────────────────────────

async function fetchCatalogueData(sp: Record<string, string>): Promise<{
  offres: OffreCatalogue[]; total: number; total_pages: number;
}> {
  const params = new URLSearchParams(sp);
  if (!params.get("page")) params.set("page", "1");

  try {
    const res = await fetch(
      `${appConfig.url}/api/catalogue?${params.toString()}`,
      { next: { revalidate: 0 } } // toujours frais — les filtres changent
    );
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return { offres: [], total: 0, total_pages: 1 };
  }
}

// ── Card component ─────────────────────────────────────────────

function Stars({ note, size = 13 }: { note: number | null; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size}
          className={i <= Math.round(note ?? 0) ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-200"} />
      ))}
    </span>
  );
}

function ImagePlaceholder({ titre }: { titre: string }) {
  const initials = titre.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-slate-200 to-slate-300 text-2xl font-bold text-slate-400">
      {initials}
    </div>
  );
}

function OffreCard({ offre }: { offre: OffreCatalogue }) {
  const cpf = (offre.metadata_vertical as Record<string, unknown> | null)?.cpf === true;
  const tags = offre.tags ?? [];

  return (
    <Link href={`/f/${offre.slug}`}
      className="flex flex-col rounded-xl border border-slate-200 bg-white transition-all duration-150 hover:shadow-md hover:-translate-y-0.5">

      {/* Image */}
      {offre.image_url ? (
        <img src={offre.image_url} alt={offre.titre}
          className="aspect-video w-full rounded-t-xl object-cover" />
      ) : (
        <ImagePlaceholder titre={offre.titre} />
      )}

      {/* Badges format + niveau */}
      <div className="flex flex-wrap gap-1.5 px-4 pt-3">
        {offre.format && FORMAT_LABELS[offre.format] && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            {FORMAT_LABELS[offre.format]}
          </span>
        )}
        {offre.niveau && NIVEAU_LABELS[offre.niveau] && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            {NIVEAU_LABELS[offre.niveau]}
          </span>
        )}
        {cpf && (
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">CPF</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Titre + prestataire */}
        <div>
          <h3 className="font-semibold text-slate-900 line-clamp-2">{offre.titre}</h3>
          {offre.prestataires?.nom && (
            <p className="mt-0.5 text-xs text-slate-400">Par {offre.prestataires.nom}</p>
          )}
        </div>

        {/* Note + avis */}
        {offre.nb_avis > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Stars note={offre.note_moyenne} />
              <span className="text-sm font-semibold text-slate-800">
                {offre.note_moyenne?.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">({offre.nb_avis} avis)</span>
            </div>
            {offre.pct_recommande !== null && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${offre.pct_recommande}%` }} />
                </div>
                <span className="text-xs text-slate-500">{offre.pct_recommande}% recommandent</span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-slate-50 px-2 py-0.5 text-xs text-slate-500 border border-slate-100">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Infos pratiques */}
        <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          {offre.duree && (
            <span className="flex items-center gap-1"><Clock size={11} />{offre.duree}</span>
          )}
          {offre.format && FORMAT_LABELS[offre.format] && (
            <span className="flex items-center gap-1"><MapPin size={11} />{FORMAT_LABELS[offre.format]}</span>
          )}
          {offre.prix != null && (
            <span className="ml-auto font-semibold text-slate-700">
              {offre.prix === 0 ? "Gratuit" : `${offre.prix.toLocaleString("fr-FR")} €`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Sort bar ───────────────────────────────────────────────────

function SortBar({ current }: { current: string }) {
  const options = [
    { value: "pertinence",   label: "Pertinence" },
    { value: "mieux_notees", label: "Mieux notées" },
    { value: "plus_avis",    label: "Plus d'avis" },
    { value: "recentes",     label: "Récentes" },
  ];
  return (
    <div className="flex items-center gap-1">
      {options.map((o) => (
        <Link key={o.value} href={`?tri=${o.value}`}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition",
            current === o.value
              ? "bg-blue-600 text-white"
              : "border border-slate-200 text-slate-600 hover:bg-slate-50"
          )}>
          {o.label}
        </Link>
      ))}
    </div>
  );
}

// ── Search bar ────────────────────────────────────────────────

function SearchBar({ defaultValue }: { defaultValue: string }) {
  return (
    <form method="GET" className="relative w-full max-w-2xl mx-auto">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Rechercher une formation, compétence, thème…"
        className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
    </form>
  );
}

// ── Pagination ────────────────────────────────────────────────

function Pagination({ page, total_pages, sp }: {
  page: number; total_pages: number; sp: Record<string, string>;
}) {
  function pageUrl(p: number) {
    const params = new URLSearchParams(sp);
    if (p === 1) params.delete("page"); else params.set("page", String(p));
    const qs = params.toString();
    return `/catalogue${qs ? `?${qs}` : ""}`;
  }

  const pages = Array.from({ length: total_pages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === total_pages || Math.abs(p - page) <= 2);

  return (
    <div className="flex items-center justify-center gap-1">
      <Link href={pageUrl(page - 1)}
        aria-disabled={page <= 1}
        className={cn("rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50",
          page <= 1 && "pointer-events-none opacity-30")}>
        <ChevronLeft size={15} />
      </Link>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        return (
          <span key={p} className="flex items-center">
            {prev && p - prev > 1 && <span className="px-1 text-slate-300">…</span>}
            <Link href={pageUrl(p)}
              className={cn("min-w-[2rem] rounded-lg border px-3 py-1.5 text-center text-sm font-medium transition",
                p === page
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}>
              {p}
            </Link>
          </span>
        );
      })}

      <Link href={pageUrl(page + 1)}
        aria-disabled={page >= total_pages}
        className={cn("rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50",
          page >= total_pages && "pointer-events-none opacity-30")}>
        <ChevronRight size={15} />
      </Link>
    </div>
  );
}

// ── Page temporaire (CATALOGUE_PUBLIC !== "true") ──────────────

function CatalogueTemporaire() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-6">
          <Link href="/" className="text-base font-semibold text-slate-900">
            {appConfig.name}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-24">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Les avis profilés arrivent.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-slate-600">
          ReviewWall affiche uniquement des avis vérifiés, rattachés à un profil réel d&rsquo;apprenant.
          <br />Pas de note gonflée. Pas de témoignage vague.
        </p>
        <p className="mt-4 text-lg text-slate-600">
          Le catalogue ouvre quand les données le méritent.
        </p>

        <div className="mt-14 border-t border-slate-100 pt-10">
          <h2 className="text-xl font-semibold text-slate-900">Formateur&nbsp;?</h2>
          <p className="mt-2 text-slate-600">
            Collectez vos premiers avis maintenant - votre fiche sera prête et mise en avant dès l&rsquo;ouverture.
          </p>
          <Link
            href="/formateurs"
            className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Devenir formateur fondateur →
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        {appConfig.name}
      </footer>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  if (!CATALOGUE_PUBLIC) return <CatalogueTemporaire />;

  const sp = await searchParams;
  const q    = sp.q ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const tri  = sp.tri ?? "pertinence";

  const { offres, total, total_pages } = await fetchCatalogueData(sp);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-2 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Catalogue des formations</h1>
            <p className="mt-1 text-slate-500">
              {total > 0
                ? `${total} formation${total > 1 ? "s" : ""} évaluée${total > 1 ? "s" : ""} par de vrais apprenants`
                : "Formations évaluées par de vrais apprenants"}
            </p>
          </div>
          <div className="mt-6">
            <Suspense>
              <SearchBar defaultValue={q} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex gap-6">
          {/* Sidebar filtres */}
          <Suspense>
            <CatalogueFilters />
          </Suspense>

          {/* Résultats */}
          <div className="flex-1 min-w-0">
            {/* Barre tri + compteur */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-800">{total}</span> formation{total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}
              </p>
              <SortBar current={tri} />
            </div>

            {/* Grille ou état vide */}
            {offres.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
                <div className="mb-3 text-4xl">🔍</div>
                <p className="font-medium text-slate-700">Aucune formation ne correspond à votre recherche</p>
                <p className="mt-1 text-sm text-slate-400">Essayez d'autres mots-clés ou réinitialisez les filtres</p>
                <Link href="/catalogue"
                  className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                  Réinitialiser les filtres
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {offres.map((offre) => (
                    <OffreCard key={offre.id} offre={offre} />
                  ))}
                </div>

                {total_pages > 1 && (
                  <div className="mt-8">
                    <Pagination page={page} total_pages={total_pages} sp={sp} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        {appConfig.name}
      </footer>
    </div>
  );
}
