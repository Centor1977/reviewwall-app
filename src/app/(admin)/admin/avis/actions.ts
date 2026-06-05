"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser, logAdminAction } from "@/lib/admin";

export async function masquerAvis(id: string) {
  const { supabase, adminId } = await requireAdminUser();
  await supabase.from("avis").update({ masque: true }).eq("id", id);
  await logAdminAction(supabase, { adminId, action: "mask_avis", cibleType: "avis", cibleId: id, detail: {} });
  revalidatePath("/admin/avis");
}

export async function restaurerAvis(id: string) {
  const { supabase, adminId } = await requireAdminUser();
  await supabase.from("avis").update({ masque: false }).eq("id", id);
  await logAdminAction(supabase, { adminId, action: "restore_avis", cibleType: "avis", cibleId: id, detail: {} });
  revalidatePath("/admin/avis");
}

export async function supprimerAvis(id: string) {
  const { supabase, adminId } = await requireAdminUser();
  await logAdminAction(supabase, { adminId, action: "delete_avis", cibleType: "avis", cibleId: id, detail: {} });
  await supabase.from("avis").delete().eq("id", id);
  revalidatePath("/admin/avis");
}
