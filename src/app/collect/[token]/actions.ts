"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { sendNouvelAvis, sendConfirmationApprenant } from "@/lib/email/send";

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

type QuestionAnswerForSubmit = {
  offreQuestionId: string;
  questionId: string;
  visibilite: string;
  dimension_profil: string | null;
  utilisable_matching: boolean;
  reponse_texte?: string;
  reponse_note?: number;
  reponse_booleen?: boolean;
  reponse_choix?: string[];
};

type AvisData = {
  profil: Record<string, string>;
  email: string | null;
  note: number;
  recommande: boolean;
  avis_texte: string;
  point_fort: string;
  point_amelioration: string;
  questionAnswers?: QuestionAnswerForSubmit[];
};

export async function submitAvis(
  token: string,
  offreId: string,
  data: AvisData,
  verticalKey?: string
): Promise<{ error: string } | void> {
  const supabase = publicClient();

  const { data: tokenRow, error: tokenError } = await supabase
    .from("collecte_tokens")
    .select("id, used")
    .eq("token", token)
    .maybeSingle();

  if (tokenError) {
    console.error("[submitAvis] token query error:", tokenError.message);
    return { error: "Erreur lors de la vérification du lien." };
  }

  if (!tokenRow || tokenRow.used) {
    return { error: "Ce lien est invalide ou a déjà été utilisé." };
  }

  const avisId = crypto.randomUUID();
  const { error: insertError } = await supabase.from("avis").insert({
    id: avisId,
    token_id: tokenRow.id,
    offre_id: offreId,
    profil: data.profil,
    note: data.note,
    recommande: data.recommande,
    avis_texte: data.avis_texte,
    point_fort: data.point_fort,
    point_amelioration: data.point_amelioration,
  });

  if (insertError) {
    console.error("[submitAvis] insert error:", insertError.message);
    return { error: "Une erreur est survenue. Veuillez réessayer." };
  }

  // Insertion des réponses aux questions
  if (data.questionAnswers?.length) {
    const reponses = data.questionAnswers
      .filter((qa) => qa.reponse_texte || qa.reponse_note != null || qa.reponse_booleen != null || qa.reponse_choix?.length)
      .map((qa) => ({
        avis_id: avisId,
        question_id: qa.questionId,
        reponse_texte: qa.reponse_texte ?? null,
        reponse_note: qa.reponse_note ?? null,
        reponse_booleen: qa.reponse_booleen ?? null,
        reponse_choix: qa.reponse_choix?.length ? qa.reponse_choix : null,
      }));
    if (reponses.length > 0) {
      await supabase.from("question_reponses").insert(reponses);
    }

    // Mise à jour profil apprenant pour questions publiques avec dimension_profil
    const publicDimQuestions = data.questionAnswers.filter(
      (qa) => qa.visibilite === "publique" && qa.dimension_profil
    );
    if (publicDimQuestions.length > 0) {
      try {
        const auth = await createAuthClient();
        const { data: { user } } = await auth.auth.getUser();
        if (user) {
          const { data: apprenant } = await auth
            .from("apprenants").select("id").eq("user_id", user.id).maybeSingle();
          if (apprenant) {
            for (const qa of publicDimQuestions) {
              const [vertical, fieldKey] = (qa.dimension_profil as string).split(".");
              if (!vertical || !fieldKey) continue;
              const valStr = qa.reponse_texte ?? qa.reponse_choix?.[0] ?? null;
              if (!valStr) continue;
              await auth.from("apprenant_profils_verticales").upsert(
                { apprenant_id: apprenant.id, vertical, profil: { [fieldKey]: valStr } },
                { onConflict: "apprenant_id,vertical" }
              );
            }
          }
        }
      } catch { /* silencieux */ }
    }
  }

  await supabase
    .from("collecte_tokens")
    .update({ used: true, used_at: new Date().toISOString() })
    .eq("id", tokenRow.id);

  if (data.email) {
    await supabase
      .from("participants")
      .update({ statut_avis: "soumis", email: data.email })
      .eq("token_id", tokenRow.id)
      .is("email", null);
  } else {
    await supabase
      .from("participants")
      .update({ statut_avis: "soumis" })
      .eq("token_id", tokenRow.id);
  }

  // Mise à jour profil vertical si l'apprenant est connecté
  if (verticalKey && Object.keys(data.profil).length > 0) {
    try {
      const auth = await createAuthClient();
      const { data: { user } } = await auth.auth.getUser();
      if (user) {
        const { data: apprenant } = await auth
          .from("apprenants")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (apprenant) {
          await auth
            .from("apprenant_profils_verticales")
            .upsert(
              { apprenant_id: apprenant.id, vertical: verticalKey, profil: data.profil },
              { onConflict: "apprenant_id,vertical" }
            );
        }
      }
    } catch { /* silencieux */ }
  }

  sendEmailsAfterAvis({ tokenId: tokenRow.id, offreId, note: data.note, avisTexte: data.avis_texte })
    .catch(console.error);

  const params = new URLSearchParams();
  if (data.email) params.set("email", data.email);

  const { data: participant } = await supabase
    .from("participants")
    .select("prenom, identifiant_anon")
    .eq("token_id", tokenRow.id)
    .maybeSingle();

  const prenom = participant?.prenom ?? participant?.identifiant_anon ?? null;
  if (prenom) params.set("prenom", prenom);

  const { data: offre } = await supabase
    .from("offres").select("titre").eq("id", offreId).maybeSingle();
  if (offre?.titre) params.set("offre", offre.titre);

  redirect(`/collect/merci?${params.toString()}`);
}

async function sendEmailsAfterAvis({
  tokenId, offreId, note, avisTexte,
}: { tokenId: string; offreId: string; note: number; avisTexte: string }) {
  const supabase = publicClient();

  const { data: offre } = await supabase
    .from("offres")
    .select("titre, prestataires(nom, email, slug)")
    .eq("id", offreId)
    .maybeSingle();

  if (!offre) return;

  const prestataire = Array.isArray(offre.prestataires)
    ? offre.prestataires[0] : offre.prestataires;

  if (prestataire?.email) {
    await sendNouvelAvis({ email: prestataire.email, nomPrestataire: prestataire.nom,
      offreTitre: offre.titre, note, avisTexte });
  }

  try {
    const { data: participant } = await supabase
      .from("participants").select("email").eq("token_id", tokenId).maybeSingle();
    if (participant?.email) {
      await sendConfirmationApprenant({ email: participant.email, offreTitre: offre.titre,
        prestataireSlug: prestataire?.slug ?? "" });
    }
  } catch { /* table absente */ }
}
