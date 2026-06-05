"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createSeance(
  offreId: string,
  data: {
    titre: string;
    mode: string;
    date_session: string | null;
    lieu: string | null;
    nb_participants_attendus: number | null;
  }
): Promise<{ error: string } | void> {
  const supabase = await createClient();

  const { data: seance, error } = await supabase
    .from("seances")
    .insert({
      offre_id: offreId,
      titre: data.titre.trim(),
      mode: data.mode,
      date_session: data.date_session || null,
      lieu: data.lieu?.trim() || null,
      nb_participants_attendus: data.nb_participants_attendus || null,
    })
    .select("id")
    .single();

  if (error) return { error: "Erreur lors de la création de la séance." };

  revalidatePath(`/offres/${offreId}`);
  redirect(`/offres/${offreId}/seances/${seance.id}`);
}
