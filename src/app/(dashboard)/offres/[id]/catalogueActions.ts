"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";

export async function updateCatalogueVisibiliteAction(
  offreId: string,
  visible: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const prestataire = await ensurePrestataire(supabase, user.id);
  if (!prestataire) return { error: "Prestataire introuvable." };

  const { error } = await supabase
    .from("offres")
    .update({ catalogue_visible: visible })
    .eq("id", offreId)
    .eq("prestataire_id", prestataire.id);

  // Le trigger prevent_catalogue_unlist remonte une exception
  // si on tente de retirer une offre avec des avis.
  if (error) return { error: error.message };

  revalidatePath(`/offres/${offreId}`);
  return {};
}
