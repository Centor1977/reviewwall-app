import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const prestataire = await ensurePrestataire(supabase, user.id);
  if (!prestataire) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const body = await request.json() as Record<string, unknown>;

  const ALLOWED_FIELDS = ["image_url"] as const;
  const update: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) update[key] = body[key] ?? null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Aucun champ modifiable." }, { status: 400 });
  }

  const { error } = await supabase
    .from("offres")
    .update(update)
    .eq("id", id)
    .eq("prestataire_id", prestataire.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
