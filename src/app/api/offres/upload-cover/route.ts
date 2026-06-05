import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const prestataire = await ensurePrestataire(supabase, user.id);
  if (!prestataire) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const offreId = formData.get("offreId") as string | null;

  if (!file || !offreId) {
    return NextResponse.json({ error: "Fichier ou offre manquant." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Format non supporté." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `covers/${prestataire.id}/${offreId}.${ext}`;
  const buffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from("offres")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (error) {
    return NextResponse.json({ error: `Upload impossible : ${error.message}` }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from("offres").getPublicUrl(path);

  await supabase
    .from("offres")
    .update({ image_url: publicUrl })
    .eq("id", offreId)
    .eq("prestataire_id", prestataire.id);

  return NextResponse.json({ url: publicUrl });
}
