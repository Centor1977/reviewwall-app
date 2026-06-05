import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { generateQRCodesPDF } from "@/lib/pdf/export-qr";

type Params = { id: string };

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  const { id: seanceId } = await params;
  const { searchParams } = new URL(request.url);
  const participantId = searchParams.get("participant_id");

  // ── Auth ──────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Non authentifié", { status: 401 });

  const prestataire = await ensurePrestataire(supabase, user.id);
  if (!prestataire) return new NextResponse("Prestataire introuvable", { status: 403 });

  // ── Séance (vérifier appartenance) ───────────────────────
  const { data: seance } = await supabase
    .from("seances")
    .select("id, titre, date_session, lieu, offre_id:offres(id, titre, prestataire_id)")
    .eq("id", seanceId)
    .maybeSingle();

  if (!seance) return new NextResponse("Séance introuvable", { status: 404 });

  const offre = Array.isArray(seance.offre_id) ? seance.offre_id[0] : seance.offre_id as { id: string; titre: string; prestataire_id: string } | null;
  if (!offre || offre.prestataire_id !== prestataire.id) {
    return new NextResponse("Accès refusé", { status: 403 });
  }

  // ── Participants ──────────────────────────────────────────
  let query = supabase
    .from("participants")
    .select("id, prenom, nom, identifiant_anon, collecte_tokens(token)")
    .eq("seance_id", seanceId)
    .not("token_id", "is", null);

  if (participantId) {
    query = query.eq("id", participantId);
  }

  const { data: participantsRaw } = await query.order("created_at", { ascending: true });

  const participants = (participantsRaw ?? [])
    .map((p) => ({
      id: p.id,
      prenom: p.prenom,
      nom: p.nom,
      identifiant_anon: p.identifiant_anon,
      token: (Array.isArray(p.collecte_tokens) ? p.collecte_tokens[0]?.token : (p.collecte_tokens as { token: string } | null)?.token) ?? "",
    }))
    .filter((p) => p.token);

  if (participants.length === 0) {
    return new NextResponse("Aucun participant avec token", { status: 400 });
  }

  // ── Génération PDF ────────────────────────────────────────
  const pdfBuffer = await generateQRCodesPDF(
    participants,
    { titre: seance.titre, date_session: seance.date_session, lieu: seance.lieu },
    { titre: offre.titre }
  );

  const slug = seance.titre.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const filename = participantId
    ? `qr-${participants[0].prenom ?? participants[0].identifiant_anon ?? "participant"}.pdf`
    : `qrcodes-${slug}.pdf`;

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
