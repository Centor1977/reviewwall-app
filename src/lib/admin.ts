import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AdminUser = { id: string };

export async function getAdminUser(
  supabase: SupabaseClient
): Promise<AdminUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  return data as AdminUser | null;
}

export async function requireAdminUser() {
  const supabase = await createClient();
  const admin = await getAdminUser(supabase);
  if (!admin) redirect("/dashboard");
  return { supabase, adminId: admin.id };
}

export async function logAdminAction(
  supabase: SupabaseClient,
  params: {
    adminId: string;
    action: string;
    cibleType: string;
    cibleId: string;
    detail?: Record<string, unknown>;
  }
) {
  const { error } = await supabase.from("admin_logs").insert({
    admin_id: params.adminId,
    action: params.action,
    cible_type: params.cibleType,
    cible_id: params.cibleId,
    detail: params.detail ?? {},
  });
  if (error) console.error("[admin_log]", error);
}
