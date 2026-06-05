"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser, logAdminAction } from "@/lib/admin";

export async function traiterSignalement(signalementId: string, avisId: string) {
  const { supabase, adminId } = await requireAdminUser();
  await supabase.from("avis").update({ masque: true }).eq("id", avisId);
  await supabase.from("signalements").update({ statut: "traite", traite_par: adminId, traite_at: new Date().toISOString() }).eq("id", signalementId);
  await logAdminAction(supabase, { adminId, action: "treat_signalement", cibleType: "signalement", cibleId: signalementId, detail: { avisId } });
  revalidatePath("/admin/signalements");
  revalidatePath("/admin/avis");
}

export async function rejeterSignalement(signalementId: string) {
  const { supabase, adminId } = await requireAdminUser();
  await supabase.from("signalements").update({ statut: "rejete", traite_par: adminId, traite_at: new Date().toISOString() }).eq("id", signalementId);
  await logAdminAction(supabase, { adminId, action: "reject_signalement", cibleType: "signalement", cibleId: signalementId, detail: {} });
  revalidatePath("/admin/signalements");
}
