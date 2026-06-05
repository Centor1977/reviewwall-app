"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getApprenant() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, apprenant: null };
  const { data } = await supabase
    .from("apprenants").select("id").eq("user_id", user.id).maybeSingle();
  return { supabase, apprenant: data };
}

export async function updateProfilAction(data: {
  prenom: string;
  nom: string;
  telephone: string;
  age_range: string;
  situation: string;
  localisation: string;
}): Promise<{ error?: string }> {
  const { supabase, apprenant } = await getApprenant();
  if (!supabase || !apprenant) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("apprenants")
    .update({
      prenom: data.prenom || null,
      nom: data.nom || null,
      telephone: data.telephone || null,
      age_range: data.age_range || null,
      situation: data.situation || null,
      localisation: data.localisation || null,
    })
    .eq("id", apprenant.id);

  if (error) return { error: error.message };
  revalidatePath("/mon-profil");
  return {};
}

export async function upsertProfilVerticalAction(
  vertical: string,
  profil: Record<string, string>
): Promise<{ error?: string }> {
  const { supabase, apprenant } = await getApprenant();
  if (!supabase || !apprenant) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("apprenant_profils_verticales")
    .upsert(
      { apprenant_id: apprenant.id, vertical, profil },
      { onConflict: "apprenant_id,vertical" }
    );

  if (error) return { error: error.message };
  revalidatePath("/mon-profil");
  return {};
}

export async function updateAvisAction(
  avisId: string,
  data: { note: number; recommande: boolean; avis_texte: string;
    point_fort: string; point_amelioration: string }
): Promise<{ error?: string }> {
  const { supabase, apprenant } = await getApprenant();
  if (!supabase || !apprenant) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("avis")
    .update(data)
    .eq("id", avisId)
    .eq("apprenant_id", apprenant.id);

  if (error) return { error: error.message };
  revalidatePath("/mon-profil");
  return {};
}

export async function deleteAvisAction(avisId: string): Promise<{ error?: string }> {
  const { supabase, apprenant } = await getApprenant();
  if (!supabase || !apprenant) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("avis")
    .update({ apprenant_id: null })
    .eq("id", avisId)
    .eq("apprenant_id", apprenant.id);

  if (error) return { error: error.message };
  revalidatePath("/mon-profil");
  return {};
}

export async function updateConsentMatchingAction(value: boolean): Promise<{ error?: string }> {
  const { supabase, apprenant } = await getApprenant();
  if (!supabase || !apprenant) return { error: "Non authentifié." };
  const { error } = await supabase
    .from("apprenants").update({ consent_matching_prive: value }).eq("id", apprenant.id);
  if (error) return { error: error.message };
  return {};
}

export async function deleteAccountAction(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: apprenant } = await supabase
    .from("apprenants").select("id").eq("user_id", user.id).maybeSingle();
  if (apprenant) {
    await supabase.from("avis").update({ apprenant_id: null }).eq("apprenant_id", apprenant.id);
    await supabase.from("apprenants").delete().eq("id", apprenant.id);
  }

  await supabase.auth.signOut();
  redirect("/");
}
