import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { Star, ExternalLink, ThumbsUp, Users } from "lucide-react";
import { appConfig } from "@/config/app";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";

export const revalidate = 3600;

type Prestataire = { nom: string; organisme: string | null };

type Offre = {
  id: string;
  titre: string;
  description: string | null;
  url_externe: string | null;
  categorie: string | null;
  vertical: string | null;
  prestataires: Prestataire | null;
};

type Avis = {
  id: string;
  note: number | null;
  recommande: boolean | null;
  avis_texte: string | null;
  point_fort: string | null;
  point_amelioration: string | null;
  profil: Record<string, string> | null;
  badge: string;
  created_at: string;
};

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

const getPageData = cache(async (slug: string) => {
  const supabase = publicClient();

  const { data: offre } = await supabase
    .from("offres")
    .select("id, titre, description, url_externe, categorie, vertical, prestataires(nom, organisme)")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (!offre) return null;

  const { data: avis } = await supabase
    .from("avis")
    .select("id, note, recommande, avis_texte, point_fort, point_amelioration, profil, badge, created_at")
    .eq("offre_id", offre.id)
    .eq("publie", true)
    .order("created_at", { ascending: false });

  return {
    offre: offre as unknown as Offre,
    avis: (avis ?? []) as Avis[],
  };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPageData(slug);

  if (!data) return { title: "Offre introuvable" };

  const { offre, avis } = data;
  const vertical = VERTICALS[(offre.vertical as Vertical) ?? DEFAULT_VERTICAL];
  const total = avis.length;
  const noteMoy =
    total > 0
      ? (avis.reduce((s, a) => s + (a.note ?? 0), 0) / total).toFixed(1)
      : null;

  const title = noteMoy
    ? `${offre.titre} — ${noteMoy}/5 basé sur ${total} avis vérifiés`
    : offre.titre;

  const description = noteMoy
    ? `${offre.titre}${offre.prestataires ? ` par ${offre.prestataires.nom}` : ""}. Note moyenne : ${noteMoy}/5 sur ${total} avis de ${vertical.client.singular}s vérifiés.`
    : `Découvrez ${vertical.offre.singular} ${offre.titre} et les avis des ${vertical.client.singular}s.`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: appConfig.name },
  };
}

// ── UI helpers ─────────────────────────────────────────────────────────────

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-200"
          }
        />
      ))}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600">
      {children}
    </span>
  );
}

function ProfilBar({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-xs capitalize text-gray-600">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs text-gray-400">{count}</span>
    </div>
  );
}

function AvisCard({ a }: { a: Avis }) {
  const date = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(new Date(a.created_at));

  const profilValues = Object.values(a.profil ?? {}).filter(Boolean);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <Stars rating={a.note ?? 0} size={14} />
        <span className="text-xs text-gray-400">{date}</span>
      </div>

      {profilValues.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profilValues.map((v) => (
            <Chip key={v}>{v}</Chip>
          ))}
        </div>
      )}

      {a.avis_texte && (
        <p className="text-sm leading-relaxed text-gray-700">{a.avis_texte}</p>
      )}

      <div className="space-y-1 text-xs">
        {a.point_fort && (
          <div className="flex items-start gap-1.5">
            <span className="mt-px font-bold text-green-500">+</span>
            <span className="text-gray-600">{a.point_fort}</span>
          </div>
        )}
        {a.point_amelioration && (
          <div className="flex items-start gap-1.5">
            <span className="mt-px font-bold text-amber-500">~</span>
            <span className="text-gray-600">{a.point_amelioration}</span>
          </div>
        )}
      </div>

      <span className="self-start rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
        {a.badge === "invite" ? "Avis invité" : a.badge}
      </span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function OffrePublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPageData(slug);

  if (!data) notFound();

  const { offre, avis } = data;
  const vertical = VERTICALS[(offre.vertical as Vertical) ?? DEFAULT_VERTICAL];
  const total = avis.length;
  const clientLabel = vertical.client.singular;

  const noteMoy =
    total > 0 ? avis.reduce((s, a) => s + (a.note ?? 0), 0) / total : 0;

  const pctRecommande =
    total > 0
      ? Math.round((avis.filter((a) => a.recommande).length / total) * 100)
      : 0;

  const firstChipsField = vertical.profil_fields.find((f) => f.type === "chips");
  const profilDistrib = firstChipsField
    ? Object.fromEntries(
        firstChipsField.options.map((opt) => [
          opt,
          avis.filter((a) => a.profil?.[firstChipsField.key] === opt).length,
        ])
      )
    : null;

  const prestataire = offre.prestataires;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          {offre.categorie && (
            <span className="mb-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
              {offre.categorie}
            </span>
          )}

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {offre.titre}
          </h1>

          {prestataire && (
            <p className="mt-2 text-sm text-gray-500">
              {prestataire.nom}
              {prestataire.organisme && (
                <span className="text-gray-400"> · {prestataire.organisme}</span>
              )}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4">
            {total > 0 && (
              <div className="flex items-center gap-2">
                <Stars rating={noteMoy} size={20} />
                <span className="text-lg font-bold text-gray-900">
                  {noteMoy.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">({total} avis)</span>
              </div>
            )}

            {offre.url_externe && (
              <a
                href={offre.url_externe}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Voir {vertical.offre.singular}
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          {offre.description && (
            <p className="mt-4 max-w-2xl text-sm text-gray-600">
              {offre.description}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {total === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">
            Aucun avis publié pour cette {vertical.offre.singular}.
          </p>
        ) : (
          <>
            {/* ── Statistiques ── */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Note moyenne
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {noteMoy.toFixed(1)}
                  <span className="ml-1 text-base font-normal text-gray-400">
                    /5
                  </span>
                </p>
                <Stars rating={noteMoy} size={14} />
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Recommandation
                </p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-gray-900">
                    {pctRecommande}%
                  </p>
                  <ThumbsUp size={18} className="mb-1 text-green-500" />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {avis.filter((a) => a.recommande).length} sur {total}{" "}
                  {clientLabel}s
                </p>
              </div>

              {profilDistrib && firstChipsField && (
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                    <Users size={12} />
                    {firstChipsField.label}
                  </p>
                  <div className="space-y-2">
                    {Object.entries(profilDistrib).map(([label, count]) => (
                      <ProfilBar
                        key={label}
                        label={label}
                        count={count}
                        total={total}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Liste des avis ── */}
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {total} avis vérifiés
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {avis.map((a) => (
                <AvisCard key={a.id} a={a} />
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="mt-8 border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Avis collectés via{" "}
        <span className="font-medium text-gray-500">{appConfig.name}</span>
      </footer>
    </div>
  );
}
