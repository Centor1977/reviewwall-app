"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function updateProfile(data: {
  prestataireId: string;
  nom: string;
  organisme: string;
  site_web: string;
  bio: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("prestataires")
    .update({
      nom: data.nom.trim(),
      slug: slugify(data.nom.trim()),
      organisme: data.organisme.trim() || null,
      site_web: data.site_web.trim() || null,
      bio: data.bio.trim() || null,
    })
    .eq("id", data.prestataireId);

  if (error) return { error: "Erreur lors de la mise à jour du profil." };
  return {};
}

export async function createOffreOnboarding(data: {
  prestataireId: string;
  titre: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("offres").insert({
    prestataire_id: data.prestataireId,
    titre: data.titre.trim(),
    slug: slugify(data.titre.trim()),
  });

  if (error) return { error: "Erreur lors de la création." };
  return {};
}

export async function completeOnboarding(
  prestataireId: string
): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("prestataires")
    .update({ onboarding_completed: true })
    .eq("id", prestataireId);

  if (error) return { error: error.message };
  redirect("/dashboard");
}
