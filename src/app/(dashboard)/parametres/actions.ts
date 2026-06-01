"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/utils";

export async function updateProfileAction(data: {
  nom: string;
  organisme: string;
  site_web: string;
  bio: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("prestataires")
    .update({
      nom: data.nom.trim(),
      slug: slugify(data.nom.trim()),
      organisme: data.organisme.trim() || null,
      site_web: data.site_web.trim() || null,
      bio: data.bio.trim() || null,
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return {};
}

export async function sendPasswordResetAction(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Email introuvable." };

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
  });

  if (error) return { error: error.message };
  return {};
}

export async function deleteAccountAction(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  // Delete prestataire data (cascades to offres, avis, tokens if FK CASCADE is set)
  await supabase.from("prestataires").delete().eq("user_id", user.id);

  // Sign out first so the session is invalidated
  await supabase.auth.signOut();

  // Delete auth user (requires service role key)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    await admin.auth.admin.deleteUser(user.id);
  }

  redirect("/");
}
