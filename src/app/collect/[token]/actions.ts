"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

type AvisData = {
  profil: Record<string, string>;
  note: number;
  recommande: boolean;
  avis_texte: string;
  point_fort: string;
  point_amelioration: string;
};

export async function submitAvis(
  token: string,
  offreId: string,
  data: AvisData
): Promise<{ error: string } | void> {
  const supabase = publicClient();

  const { data: tokenRow } = await supabase
    .from("collecte_tokens")
    .select("id, used")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || tokenRow.used) {
    return { error: "Ce lien est invalide ou a déjà été utilisé." };
  }

  const { error: insertError } = await supabase.from("avis").insert({
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
    return { error: "Une erreur est survenue. Veuillez réessayer." };
  }

  await supabase
    .from("collecte_tokens")
    .update({ used: true, used_at: new Date().toISOString() })
    .eq("id", tokenRow.id);

  redirect("/collect/merci");
}
