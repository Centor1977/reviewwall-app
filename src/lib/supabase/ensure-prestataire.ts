import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/utils";
import { DEFAULT_VERTICAL } from "@/config/verticals";

export type Prestataire = {
  id: string;
  user_id: string;
  nom: string;
  slug: string;
  organisme: string | null;
  plan: string;
  vertical: string;
  onboarding_completed: boolean;
  site_web: string | null;
  bio: string | null;
};

const SELECT =
  "id, user_id, nom, slug, organisme, plan, vertical, onboarding_completed, site_web, bio";

export async function ensurePrestataire(
  supabase: SupabaseClient,
  userId: string
): Promise<Prestataire | null> {
  const { data: existing } = await supabase
    .from("prestataires")
    .select(SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing as Prestataire;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const nom =
    (user.user_metadata?.nom as string | undefined) ?? user.email ?? "Prestataire";
  const organisme =
    (user.user_metadata?.organisme as string | null | undefined) ?? null;

  const { data: created, error } = await supabase
    .from("prestataires")
    .insert({
      user_id: userId,
      nom,
      slug: slugify(nom),
      organisme,
      vertical: DEFAULT_VERTICAL,
    })
    .select(SELECT)
    .single();

  if (error) return null;
  return created as Prestataire;
}
