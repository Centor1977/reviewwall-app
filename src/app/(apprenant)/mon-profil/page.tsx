import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MonProfilClient } from "./MonProfilClient";

type AvisRow = {
  id: string;
  note: number | null;
  recommande: boolean | null;
  avis_texte: string | null;
  point_fort: string | null;
  point_amelioration: string | null;
  created_at: string;
  offres: { titre: string; vertical: string | null } | null;
};

type ProfilVertical = {
  id: string;
  vertical: string;
  profil: Record<string, string>;
};

export default async function MonProfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion-apprenant");

  const { data: apprenant } = await supabase
    .from("apprenants")
    .select("id, prenom, nom, email, telephone, age_range, situation, localisation, consent_matching_prive")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!apprenant) {
    await supabase.from("apprenants").insert({ user_id: user.id, email: user.email });
    redirect("/mon-profil");
  }

  const [{ data: avisRaw }, { data: profilsRaw }] = await Promise.all([
    supabase
      .from("avis")
      .select("id, note, recommande, avis_texte, point_fort, point_amelioration, created_at, offres(titre, vertical)")
      .eq("apprenant_id", apprenant.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("apprenant_profils_verticales")
      .select("id, vertical, profil")
      .eq("apprenant_id", apprenant.id),
  ]);

  const avisIds = (avisRaw ?? []).map((a) => a.id);
  const { data: reponsesRaw } = avisIds.length > 0
    ? await supabase
        .from("question_reponses")
        .select("id, avis_id, reponse_texte, reponse_note, reponse_booleen, reponse_choix, question:questions_bibliotheque(id, texte, type_reponse, visibilite_defaut)")
        .in("avis_id", avisIds)
    : { data: [] };

  const avisList = (avisRaw ?? []) as unknown as AvisRow[];
  const profilsVerticales = (profilsRaw ?? []) as ProfilVertical[];

  return (
    <MonProfilClient
      apprenant={apprenant}
      profilsVerticales={profilsVerticales}
      avisList={avisList}
      reponsesRaw={(reponsesRaw ?? []) as never}
      userEmail={user.email ?? ""}
    />
  );
}
