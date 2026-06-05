"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getPrestataire() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, prestataire: null };
  const { data: prestataire } = await supabase
    .from("prestataires")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  return { supabase, prestataire };
}

export async function createTemplateAction(data: {
  nom: string;
  objet: string;
  corps: string;
}): Promise<{ error?: string; id?: string }> {
  const { supabase, prestataire } = await getPrestataire();
  if (!supabase || !prestataire) return { error: "Non authentifié." };

  const { data: tpl, error } = await supabase
    .from("message_templates")
    .insert({ prestataire_id: prestataire.id, ...data, canal: "email" })
    .select("id")
    .single();

  if (error) return { error: "Erreur lors de la création." };
  revalidatePath("/parametres");
  return { id: tpl.id };
}

export async function updateTemplateAction(
  id: string,
  data: { nom: string; objet: string; corps: string }
): Promise<{ error?: string }> {
  const { supabase, prestataire } = await getPrestataire();
  if (!supabase || !prestataire) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("message_templates")
    .update(data)
    .eq("id", id)
    .eq("prestataire_id", prestataire.id);

  if (error) return { error: "Erreur lors de la mise à jour." };
  revalidatePath("/parametres");
  return {};
}

export async function deleteTemplateAction(id: string): Promise<{ error?: string }> {
  const { supabase, prestataire } = await getPrestataire();
  if (!supabase || !prestataire) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("message_templates")
    .delete()
    .eq("id", id)
    .eq("prestataire_id", prestataire.id);

  if (error) return { error: "Erreur lors de la suppression." };
  revalidatePath("/parametres");
  return {};
}
