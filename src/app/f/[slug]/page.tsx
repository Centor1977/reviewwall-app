import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { Star, ExternalLink, ThumbsUp, Users, Check, Zap, Clock, Globe, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { appConfig } from "@/config/app";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import { SignalerButton } from "./SignalerModal";
import { Footer } from "@/components/Footer";

const NIVEAU_LABELS: Record<string, string> = {
  tous_niveaux: "Tous niveaux", debutant: "Débutant",
  intermediaire: "Intermédiaire", avance: "Avancé",
};
const FORMAT_LABELS: Record<string, string> = {
  presentiel: "Présentiel", distanciel: "Distanciel",
  blended: "Blended", video: "Vidéo", mixte: "Mixte",
};

export const revalidate = 3600;

type Prestataire = { nom: string; organisme: string | null };

type Offre = {
  id: string; titre: string;
  description: string | null; description_courte: string | null;
  description_longue: string | null; image_url: string | null;
  niveau: string | null; duree: string | null; format: string | null;
  langue: string | null; prix: number | null; tags: string[] | null;
  url_externe: string | null; categorie: string | null; vertical: string | null;
  metadata_vertical: Record<string, unknown> | null;
  prestataires: Prestataire | null;
};

type QuestionReponsePublique = {
  question_texte: string;
  reponse: string;
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
  reponsesPubliques?: QuestionReponsePublique[];
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
    .select("id, titre, description, description_courte, description_longue, image_url, niveau, duree, format, langue, prix, tags, url_externe, categorie, vertical, metadata_vertical, prestataires(nom, organisme)")
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

  const avisIds = (avis ?? []).map((a) => a.id);
  const { data: reponsesRaw } = avisIds.length > 0
    ? await supabase
        .from("question_reponses")
        .select("avis_id, reponse_texte, reponse_note, reponse_booleen, reponse_choix, question:questions_bibliotheque(texte)")
        .in("avis_id", avisIds)
    // RLS question_reponses_public_read filtre automatiquement les privées
    : { data: [] as { avis_id: string; reponse_texte: string | null; reponse_note: number | null; reponse_booleen: boolean | null; reponse_choix: string[] | null; question: { texte: string } | null }[] };

  const reponsesByAvis: Record<string, QuestionReponsePublique[]> = {};
  for (const r of reponsesRaw ?? []) {
    const rep = r.reponse_texte ?? r.reponse_choix?.join(", ")
      ?? (r.reponse_booleen != null ? (r.reponse_booleen ? "Oui" : "Non") : null)
      ?? (r.reponse_note != null ? `${r.reponse_note}/5` : null);
    const qTexte = Array.isArray(r.question) ? r.question[0]?.texte : r.question?.texte;
    if (!rep || !qTexte) continue;
    if (!reponsesByAvis[r.avis_id]) reponsesByAvis[r.avis_id] = [];
    reponsesByAvis[r.avis_id].push({ question_texte: qTexte as string, reponse: rep });
  }

  const avisWithReponses: Avis[] = (avis ?? []).map((a) => ({
    ...(a as Avis),
    reponsesPubliques: reponsesByAvis[a.id] ?? [],
  }));

  return {
    offre: offre as unknown as Offre,
    avis: avisWithReponses,
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

      {/* Réponses aux questions publiques */}
      {(a.reponsesPubliques?.length ?? 0) > 0 && (
        <div className="space-y-1 border-t border-gray-100 pt-3 text-xs">
          {a.reponsesPubliques!.map((r, i) => (
            <div key={i} className="flex gap-2 text-gray-600">
              <span className="shrink-0 text-gray-400">›</span>
              <span>{r.question_texte} <span className="font-medium text-gray-800">→ {r.reponse}</span></span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
          {a.badge === "invite" ? "Avis invité" : a.badge}
        </span>
        <SignalerButton avisId={a.id} />
      </div>
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
  const meta = (offre.metadata_vertical ?? {}) as Record<string, unknown>;
  const objectifs    = (meta.objectifs    as string[] | undefined) ?? [];
  const prerequis    = (meta.prerequis    as string[] | undefined) ?? [];
  const publicCible  = (meta.public_cible as string   | undefined) ?? "";
  const programme    = (meta.programme    as { titre: string; contenu: string }[] | undefined) ?? [];
  const competences  = (meta.competences  as string[] | undefined) ?? [];
  const cpf          = meta.cpf          === true;
  const opco         = meta.opco         === true;
  const certification= meta.certification=== true;
  const certDetail   = (meta.certification_detail as string | undefined) ?? "";
  const tagsArr      = (offre.tags as string[] | null) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="border-b border-gray-200 bg-white">
        {offre.image_url && (
          <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
            <img src={offre.image_url} alt={offre.titre}
              className="aspect-video w-full rounded-xl object-cover" />
          </div>
        )}
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {offre.categorie && (
              <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
                {offre.categorie}
              </span>
            )}
            {offre.niveau && NIVEAU_LABELS[offre.niveau] && (
              <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600">
                {NIVEAU_LABELS[offre.niveau]}
              </span>
            )}
            {offre.format && FORMAT_LABELS[offre.format] && (
              <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600">
                {FORMAT_LABELS[offre.format]}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{offre.titre}</h1>

          {prestataire && (
            <p className="mt-1.5 text-sm text-gray-500">
              {prestataire.nom}
              {prestataire.organisme && <span className="text-gray-400"> · {prestataire.organisme}</span>}
            </p>
          )}

          {(offre.description_courte || offre.description) && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
              {offre.description_courte ?? offre.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4">
            {total > 0 && (
              <div className="flex items-center gap-2">
                <Stars rating={noteMoy} size={18} />
                <span className="font-bold text-gray-900">{noteMoy.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({total} avis · {pctRecommande}% recommandent)</span>
              </div>
            )}
            {offre.prix != null && (
              <span className="text-lg font-bold text-gray-900">
                {offre.prix === 0 ? "Gratuit" : `${offre.prix.toLocaleString("fr-FR")} €`}
              </span>
            )}
            {offre.url_externe && (
              <a href={offre.url_externe} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                Voir {vertical.offre.singular} <ExternalLink size={14} />
              </a>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {offre.duree  && <span className="flex items-center gap-1"><Clock size={12} />{offre.duree}</span>}
            {offre.langue && <span className="flex items-center gap-1"><Globe size={12} />{offre.langue === "fr" ? "Français" : offre.langue === "en" ? "Anglais" : offre.langue}</span>}
          </div>

          {tagsArr.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tagsArr.map((t) => (
                <span key={t} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 hover:bg-slate-200 transition">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">

        {/* ── Ce que vous allez apprendre ── */}
        {objectifs.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <BookOpen size={18} className="text-blue-600" />
              Ce que vous allez apprendre
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {objectifs.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check size={15} className="mt-0.5 shrink-0 text-green-500" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Description longue ── */}
        {offre.description_longue && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Description</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown>{offre.description_longue}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* ── Programme ── */}
        {programme.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Programme</h2>
            <div className="space-y-2">
              {programme.map((section, i) => (
                <details key={i} className="group rounded-lg border border-gray-100">
                  <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition">
                    {section.titre}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  {section.contenu && (
                    <p className="border-t border-gray-100 px-4 py-3 text-sm leading-relaxed text-gray-600">
                      {section.contenu}
                    </p>
                  )}
                </details>
              ))}
            </div>
          </div>
        )}

        {/* ── Pour qui + Prérequis ── */}
        {(publicCible || prerequis.length > 0) && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Cette {vertical.offre.singular} est faite pour vous si…
            </h2>
            {publicCible && <p className="mb-4 text-sm text-gray-700">{publicCible}</p>}
            {prerequis.length > 0 && (
              <>
                <p className="mb-2 text-sm font-medium text-gray-700">Prérequis</p>
                <ul className="space-y-1">
                  {prerequis.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Zap size={13} className="mt-0.5 shrink-0 text-amber-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* ── Compétences acquises ── */}
        {competences.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Compétences acquises</h2>
            <div className="flex flex-wrap gap-2">
              {competences.map((c, i) => (
                <span key={i} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200 transition">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Infos pratiques ── */}
        {(offre.format || offre.duree || offre.langue || offre.niveau || cpf || opco || certification) && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Infos pratiques</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {offre.format  && <div><p className="text-xs text-gray-400">Format</p><p className="text-sm font-medium text-gray-800">{FORMAT_LABELS[offre.format] ?? offre.format}</p></div>}
              {offre.duree   && <div><p className="text-xs text-gray-400">Durée</p><p className="text-sm font-medium text-gray-800">{offre.duree}</p></div>}
              {offre.langue  && <div><p className="text-xs text-gray-400">Langue</p><p className="text-sm font-medium text-gray-800">{offre.langue === "fr" ? "Français" : offre.langue === "en" ? "Anglais" : offre.langue}</p></div>}
              {offre.niveau  && <div><p className="text-xs text-gray-400">Niveau</p><p className="text-sm font-medium text-gray-800">{NIVEAU_LABELS[offre.niveau] ?? offre.niveau}</p></div>}
            </div>
            {(cpf || opco || certification) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {cpf          && <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">✓ Éligible CPF</span>}
                {opco         && <span className="rounded-full bg-blue-50  px-3 py-1 text-xs font-medium text-blue-700" >✓ Financement OPCO</span>}
                {certification && <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">✓ Certifiante{certDetail ? ` — ${certDetail}` : ""}</span>}
              </div>
            )}
          </div>
        )}

      </div>

      <div className="mx-auto max-w-4xl px-4 pb-8 sm:px-6">
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

      <Footer />
    </div>
  );
}
