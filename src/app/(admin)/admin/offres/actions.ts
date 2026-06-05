"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser, logAdminAction } from "@/lib/admin";

export async function forcerDepublicationOffre(id: string) {
  const { supabase, adminId } = await requireAdminUser();
  await supabase.from("offres").update({ catalogue_visible: false }).eq("id", id);
  await logAdminAction(supabase, { adminId, action: "force_unpublish_offre", cibleType: "offre", cibleId: id, detail: {} });
  revalidatePath("/admin/offres");
}
