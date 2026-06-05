"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser, logAdminAction } from "@/lib/admin";

export async function suspendrePrestataire(id: string, raison: string) {
  const { supabase, adminId } = await requireAdminUser();
  await supabase.from("prestataires").update({ statut: "suspendu" }).eq("id", id);
  await logAdminAction(supabase, { adminId, action: "suspend_prestataire", cibleType: "prestataire", cibleId: id, detail: { raison } });
  revalidatePath("/admin/prestataires");
  revalidatePath(`/admin/prestataires/${id}`);
}

export async function reactiverPrestataire(id: string) {
  const { supabase, adminId } = await requireAdminUser();
  await supabase.from("prestataires").update({ statut: "actif" }).eq("id", id);
  await logAdminAction(supabase, { adminId, action: "unsuspend_prestataire", cibleType: "prestataire", cibleId: id, detail: {} });
  revalidatePath("/admin/prestataires");
  revalidatePath(`/admin/prestataires/${id}`);
}

export async function bannirPrestataire(id: string, raison: string) {
  const { supabase, adminId } = await requireAdminUser();
  await supabase.from("prestataires").update({ statut: "banni" }).eq("id", id);
  await logAdminAction(supabase, { adminId, action: "ban_prestataire", cibleType: "prestataire", cibleId: id, detail: { raison } });
  revalidatePath("/admin/prestataires");
  revalidatePath(`/admin/prestataires/${id}`);
}

export async function changerPlan(id: string, plan: string, expireAt: string | null) {
  const { supabase, adminId } = await requireAdminUser();
  await supabase.from("prestataires").update({ plan, plan_expire_at: expireAt ?? null }).eq("id", id);
  await logAdminAction(supabase, { adminId, action: "change_plan", cibleType: "prestataire", cibleId: id, detail: { plan, expireAt } });
  revalidatePath("/admin/prestataires");
  revalidatePath(`/admin/prestataires/${id}`);
}
