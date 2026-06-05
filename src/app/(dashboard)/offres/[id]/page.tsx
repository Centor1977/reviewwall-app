import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import { appConfig } from "@/config/app";
import { OffreHeader } from "@/components/offres/OffreHeader";
import { BlocFiche } from "@/components/offres/BlocFiche";
import { BlocSeances } from "@/components/offres/BlocSeances";
import { BlocAvis } from "@/components/offres/BlocAvis";
import { BlocQuestions } from "@/components/offres/BlocQuestions";
import { BlocDiffusion } from "@/components/offres/BlocDiffusion";
import { calculateCompletion } from "@/lib/offres/completion";
import type { QuestionItem } from "./questionsActions";
import type { SeancePreview } from "@/components/offres/BlocSeances";
import type { AvisPreview } from "@/components/offres/BlocAvis";

type Params = { id: string };

export default async function OffreDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const prestataire = await ensurePrestataire(supabase, user!.id);
  if (!prestataire) notFound();

  const { data: offre } = await supabase
    .from("offres")
    .select(
      "id, titre, categorie, active, slug, image_url, niveau, format, duree, prix, catalogue_visible, catalogue_force, metadata_vertical, description_courte, description_longue, tags"
    )
    .eq("id", id)
    .eq("prestataire_id", prestataire.id)
    .maybeSingle();

  if (!offre) notFound();

  const [{ data: seancesRaw }, { data: allAvisRaw }, { data: offreQuestionsRaw }] =
    await Promise.all([
      supabase
        .from("seances")
        .select(
          "id, titre, mode, statut, nb_participants_attendus, participants(statut_avis)"
        )
        .eq("offre_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("avis")
        .select("id, note, recommande, avis_texte, profil, created_at")
        .eq("offre_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("offre_questions")
        .select(
          "id, ordre, visibilite, question:questions_bibliotheque(id, texte, type_reponse, options, visibilite_defaut, dimension_profil, utilisable_matching, validee, validation_ia)"
        )
        .eq("offre_id", id)
        .order("ordre", { ascending: true }),
    ]);

  const seances = (seancesRaw ?? []) as unknown as SeancePreview[];
  const allAvis = (allAvisRaw ?? []) as unknown as (AvisPreview & {
    recommande: boolean | null;
  })[];
  const allQuestions = (offreQuestionsRaw ?? []) as unknown as QuestionItem[];

  // Complétion fiche
  const completion = calculateCompletion(offre);

  // Stats agrégées
  const nbAvis = allAvis.length;
  const noteMoyenne =
    nbAvis > 0 ? allAvis.reduce((s, a) => s + (a.note ?? 0), 0) / nbAvis : null;
  const pourcentRecommande =
    nbAvis > 0
      ? Math.round((allAvis.filter((a) => a.recommande).length / nbAvis) * 100)
      : null;
  const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const deltaAvisSemaine = allAvis.filter((a) => a.created_at > oneWeekAgo).length;
  const nbParticipants = seances.reduce((s, se) => s + se.participants.length, 0);
  const nbAvisReçus = seances.reduce(
    (s, se) => s + se.participants.filter((p) => p.statut_avis === "soumis").length,
    0
  );
  const tauxReponse =
    nbParticipants > 0 ? Math.round((nbAvisReçus / nbParticipants) * 100) : null;

  const verticalKey = (prestataire.vertical as Vertical) ?? DEFAULT_VERTICAL;
  const publicUrl = `${appConfig.url}/f/${offre.slug}`;
  const widgetUrl = `${appConfig.url}/widget/${offre.slug}`;
  const iframeCode = `<iframe\n  src="${widgetUrl}"\n  width="100%"\n  height="500"\n  frameborder="0"\n  style="border:none;"\n  loading="lazy"\n></iframe>`;

  return (
    <div className="max-w-5xl">
      <OffreHeader
        offre={{
          id: offre.id,
          titre: offre.titre,
          categorie: offre.categorie ?? null,
          image_url: offre.image_url ?? null,
          niveau: offre.niveau ?? null,
          format: offre.format ?? null,
          duree: offre.duree ?? null,
          prix: (offre as Record<string, unknown>).prix as string | null ?? null,
          metadata_vertical:
            (offre.metadata_vertical as Record<string, unknown> | null) ?? null,
        }}
        completionScore={completion.score}
        stats={{
          noteMoyenne,
          nbAvis,
          deltaAvisSemaine,
          pourcentRecommande,
          nbSeances: seances.length,
          nbParticipants,
          tauxReponse,
        }}
        publicUrl={publicUrl}
      />

      <BlocFiche completion={completion} offreId={id} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BlocSeances offreId={id} seances={seances} />
        <BlocAvis offreId={id} avis={allAvis.slice(0, 3)} />
        <BlocQuestions
          offreId={id}
          verticalKey={verticalKey}
          questions={allQuestions}
        />
        <BlocDiffusion
          offreId={id}
          offreSlug={offre.slug}
          publicUrl={publicUrl}
          catalogueVisible={offre.catalogue_visible ?? false}
          catalogueForce={offre.catalogue_force ?? false}
          iframeCode={iframeCode}
        />
      </div>
    </div>
  );
}
