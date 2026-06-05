import { createClient } from "@/lib/supabase/server";

// Migration requise :
// ALTER TABLE prestataires ADD COLUMN IF NOT EXISTS widget_integre boolean DEFAULT false;

export interface GuideProgress {
  compte_cree: boolean;
  formation_creee: boolean;
  questions_configurees: boolean;
  seance_creee: boolean;
  lien_envoye: boolean;
  widget_integre: boolean;
}

export async function getGuideProgress(
  prestataire_id: string
): Promise<GuideProgress> {
  const supabase = await createClient();

  // Offres + widget_integre en parallèle
  const [{ data: offresData }, { data: presData }] = await Promise.all([
    supabase.from("offres").select("id").eq("prestataire_id", prestataire_id),
    supabase
      .from("prestataires")
      .select("widget_integre")
      .eq("id", prestataire_id)
      .maybeSingle(),
  ]);

  const offreIds = (offresData ?? []).map((o) => o.id);
  const widget_integre = Boolean(presData?.widget_integre);

  if (offreIds.length === 0) {
    return {
      compte_cree: true,
      formation_creee: false,
      questions_configurees: false,
      seance_creee: false,
      lien_envoye: false,
      widget_integre,
    };
  }

  // Requêtes dépendantes des offres
  const [
    { count: questionsCount },
    { data: seancesData },
    { count: envoisCount },
  ] = await Promise.all([
    supabase
      .from("offre_questions")
      .select("*", { count: "exact", head: true })
      .in("offre_id", offreIds),
    supabase.from("seances").select("id").in("offre_id", offreIds),
    supabase
      .from("envois")
      .select("*", { count: "exact", head: true })
      .eq("prestataire_id", prestataire_id),
  ]);

  const seanceIds = (seancesData ?? []).map((s) => s.id);
  const { count: participantsCount } =
    seanceIds.length > 0
      ? await supabase
          .from("participants")
          .select("*", { count: "exact", head: true })
          .in("seance_id", seanceIds)
      : { count: 0 };

  return {
    compte_cree: true,
    formation_creee: true,
    questions_configurees: (questionsCount ?? 0) > 0,
    seance_creee: (participantsCount ?? 0) > 0,
    lien_envoye: (envoisCount ?? 0) > 0,
    widget_integre,
  };
}
