import type { SupabaseClient } from "@supabase/supabase-js";

export type UserRoles = { isPrestataire: boolean; isApprenant: boolean };

export async function getUserRoles(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRoles> {
  const [{ data: prestataire }, { data: apprenant }] = await Promise.all([
    supabase.from("prestataires").select("id").eq("user_id", userId).maybeSingle(),
    supabase.from("apprenants").select("id").eq("user_id", userId).maybeSingle(),
  ]);
  return { isPrestataire: !!prestataire, isApprenant: !!apprenant };
}
