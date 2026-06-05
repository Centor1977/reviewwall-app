"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";

export type ValidationIA = { statut: "ok" | "warning" | "error"; message: string };

export type QuestionData = {
  id: string;
  texte: string;
  type_reponse: string;
  options: string[] | null;
  visibilite_defaut: string;
  dimension_profil: string | null;
  utilisable_matching: boolean;
  validee: boolean;
  validation_ia: ValidationIA | null;
};

export type QuestionItem = {
  id: string; // offre_questions.id
  ordre: number;
  visibilite: string;
  question: QuestionData;
};

export type QuestionBiblio = QuestionData & {
  nb_offres: number;
};

async function getContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, prestataire: null };
  const prestataire = await ensurePrestataire(supabase, user.id);
  return { supabase, prestataire };
}

// ── Créer ou modifier une question + associer à l'offre ───────

export async function saveQuestionAction(data: {
  id?: string;
  offreId: string;
  texte: string;
  type_reponse: string;
  options: string[] | null;
  visibilite_defaut: string;
  visibilite_pour_offre: string;
  dimension_profil: string | null;
  utilisable_matching: boolean;
  validation_ia: ValidationIA | null;
}): Promise<{ error?: string; item?: QuestionItem }> {
  const { supabase, prestataire } = await getContext();
  if (!supabase || !prestataire) return { error: "Non authentifié." };

  const validee = data.validation_ia?.statut === "ok";
  let questionId = data.id;

  if (!questionId) {
    const { data: newQ, error } = await supabase
      .from("questions_bibliotheque")
      .insert({
        prestataire_id: prestataire.id,
        texte: data.texte,
        type_reponse: data.type_reponse,
        options: data.options,
        visibilite_defaut: data.visibilite_defaut,
        dimension_profil: data.dimension_profil || null,
        utilisable_matching: data.utilisable_matching,
        validee,
        validation_ia: data.validation_ia,
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    questionId = newQ.id;
  } else {
    const { error } = await supabase
      .from("questions_bibliotheque")
      .update({
        texte: data.texte,
        type_reponse: data.type_reponse,
        options: data.options,
        visibilite_defaut: data.visibilite_defaut,
        dimension_profil: data.dimension_profil || null,
        utilisable_matching: data.utilisable_matching,
        validee,
        validation_ia: data.validation_ia,
      })
      .eq("id", questionId)
      .eq("prestataire_id", prestataire.id);
    if (error) return { error: error.message };
  }

  // Récupère l'ordre max actuel pour mettre en fin de liste
  const { data: maxOrdre } = await supabase
    .from("offre_questions")
    .select("ordre")
    .eq("offre_id", data.offreId)
    .order("ordre", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: oq, error: oqErr } = await supabase
    .from("offre_questions")
    .upsert(
      {
        offre_id: data.offreId,
        question_id: questionId,
        visibilite: data.visibilite_pour_offre,
        ordre: (maxOrdre?.ordre ?? 0) + 1,
      },
      { onConflict: "offre_id,question_id" }
    )
    .select("id, ordre, visibilite")
    .single();
  if (oqErr) return { error: oqErr.message };

  const { data: qData } = await supabase
    .from("questions_bibliotheque")
    .select("id, texte, type_reponse, options, visibilite_defaut, dimension_profil, utilisable_matching, validee, validation_ia")
    .eq("id", questionId)
    .single();

  revalidatePath(`/offres/${data.offreId}`);
  return {
    item: {
      id: oq.id,
      ordre: oq.ordre,
      visibilite: oq.visibilite,
      question: qData as QuestionData,
    },
  };
}

// ── Ajouter depuis la bibliothèque ────────────────────────────

export async function addQuestionsToOffreAction(data: {
  offreId: string;
  questionIds: string[];
}): Promise<{ error?: string; items?: QuestionItem[] }> {
  const { supabase, prestataire } = await getContext();
  if (!supabase || !prestataire) return { error: "Non authentifié." };

  const { data: questions } = await supabase
    .from("questions_bibliotheque")
    .select("id, visibilite_defaut")
    .in("id", data.questionIds)
    .eq("prestataire_id", prestataire.id);
  if (!questions?.length) return { error: "Questions introuvables." };

  const { data: maxOrdre } = await supabase
    .from("offre_questions")
    .select("ordre")
    .eq("offre_id", data.offreId)
    .order("ordre", { ascending: false })
    .limit(1)
    .maybeSingle();

  const toInsert = questions.map((q, i) => ({
    offre_id: data.offreId,
    question_id: q.id,
    visibilite: q.visibilite_defaut,
    ordre: (maxOrdre?.ordre ?? 0) + i + 1,
  }));

  const { error } = await supabase
    .from("offre_questions")
    .upsert(toInsert, { onConflict: "offre_id,question_id" });
  if (error) return { error: error.message };

  // Retourne les items créés
  const { data: created } = await supabase
    .from("offre_questions")
    .select(`id, ordre, visibilite, question:questions_bibliotheque(id, texte, type_reponse, options, visibilite_defaut, dimension_profil, utilisable_matching, validee, validation_ia)`)
    .eq("offre_id", data.offreId)
    .in("question_id", data.questionIds)
    .order("ordre", { ascending: true });

  revalidatePath(`/offres/${data.offreId}`);
  return { items: (created ?? []) as unknown as QuestionItem[] };
}

// ── Retirer une question de l'offre ──────────────────────────

export async function removeQuestionFromOffreAction(data: {
  offreQuestionId: string;
  offreId: string;
}): Promise<{ error?: string }> {
  const { supabase, prestataire } = await getContext();
  if (!supabase || !prestataire) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("offre_questions")
    .delete()
    .eq("id", data.offreQuestionId);
  if (error) return { error: error.message };

  revalidatePath(`/offres/${data.offreId}`);
  return {};
}

// ── Basculer la visibilité d'une question pour cette offre ────

export async function updateVisibiliteOffreAction(data: {
  offreQuestionId: string;
  offreId: string;
  visibilite: string;
}): Promise<{ error?: string }> {
  const { supabase, prestataire } = await getContext();
  if (!supabase || !prestataire) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("offre_questions")
    .update({ visibilite: data.visibilite })
    .eq("id", data.offreQuestionId);
  if (error) return { error: error.message };

  revalidatePath(`/offres/${data.offreId}`);
  return {};
}

// ── Réordonner les questions ───────────────────────────────────

export async function reorderQuestionsAction(data: {
  offreId: string;
  ordres: { offreQuestionId: string; ordre: number }[];
}): Promise<{ error?: string }> {
  const { supabase, prestataire } = await getContext();
  if (!supabase || !prestataire) return { error: "Non authentifié." };

  await Promise.all(
    data.ordres.map(({ offreQuestionId, ordre }) =>
      supabase.from("offre_questions").update({ ordre }).eq("id", offreQuestionId)
    )
  );

  revalidatePath(`/offres/${data.offreId}`);
  return {};
}

// ── Lire la bibliothèque complète du prestataire ──────────────

export async function getQuestionsBibliothequeAction(): Promise<{
  questions: QuestionBiblio[];
  error?: string;
}> {
  const { supabase, prestataire } = await getContext();
  if (!supabase || !prestataire) return { questions: [], error: "Non authentifié." };

  const { data, error } = await supabase
    .from("questions_bibliotheque")
    .select(
      "id, texte, type_reponse, options, visibilite_defaut, dimension_profil, utilisable_matching, validee, validation_ia, offre_questions(offre_id)"
    )
    .eq("prestataire_id", prestataire.id)
    .order("created_at", { ascending: false });

  if (error) return { questions: [], error: error.message };

  const questions: QuestionBiblio[] = (data ?? []).map((q) => ({
    id: q.id,
    texte: q.texte,
    type_reponse: q.type_reponse,
    options: q.options as string[] | null,
    visibilite_defaut: q.visibilite_defaut,
    dimension_profil: q.dimension_profil,
    utilisable_matching: q.utilisable_matching,
    validee: q.validee,
    validation_ia: q.validation_ia as ValidationIA | null,
    nb_offres: Array.isArray(q.offre_questions) ? q.offre_questions.length : 0,
  }));

  return { questions };
}
