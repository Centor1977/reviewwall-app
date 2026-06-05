"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

type ParticipantInput = {
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
};

type ExtractedParticipant = {
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
};

// ── Helpers ─────────────────────────────────────────────────

async function createTokenForParticipant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  offreId: string,
  seanceId: string
) {
  const token = nanoid(12);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("collecte_tokens")
    .insert({ token, offre_id: offreId, seance_id: seanceId, expires_at: expiresAt })
    .select("id")
    .single();

  if (error) throw new Error("Erreur création token");
  return { tokenId: data.id, token };
}

function revalidate(offreId: string, seanceId: string) {
  revalidatePath(`/offres/${offreId}/seances/${seanceId}`);
}

// ── Ajout manuel ─────────────────────────────────────────────

export async function addParticipantManuel(
  seanceId: string,
  offreId: string,
  data: ParticipantInput
): Promise<{ error?: string }> {
  const supabase = await createClient();

  try {
    const { tokenId } = await createTokenForParticipant(supabase, offreId, seanceId);

    const { error } = await supabase.from("participants").insert({
      seance_id: seanceId,
      token_id: tokenId,
      prenom: data.prenom?.trim() || null,
      nom: data.nom?.trim() || null,
      email: data.email?.trim() || null,
      telephone: data.telephone?.trim() || null,
      mode_ajout: "manuel",
    });

    if (error) return { error: "Erreur lors de l'ajout du participant." };
    revalidate(offreId, seanceId);
    return {};
  } catch {
    return { error: "Erreur inattendue." };
  }
}

// ── Import CSV ────────────────────────────────────────────────

export async function addParticipantsCSV(
  seanceId: string,
  offreId: string,
  participants: ParticipantInput[]
): Promise<{ error?: string; count?: number }> {
  const supabase = await createClient();

  try {
    const rows = await Promise.all(
      participants.map(async (p) => {
        const { tokenId } = await createTokenForParticipant(supabase, offreId, seanceId);
        return {
          seance_id: seanceId,
          token_id: tokenId,
          prenom: p.prenom?.trim() || null,
          nom: p.nom?.trim() || null,
          email: p.email?.trim() || null,
          telephone: p.telephone?.trim() || null,
          mode_ajout: "csv",
        };
      })
    );

    const { error } = await supabase.from("participants").insert(rows);
    if (error) return { error: "Erreur lors de l'import." };

    revalidate(offreId, seanceId);
    return { count: rows.length };
  } catch {
    return { error: "Erreur inattendue." };
  }
}

// ── Génération anonyme ────────────────────────────────────────

export async function addParticipantsAnonymous(
  seanceId: string,
  offreId: string,
  count: number
): Promise<{ error?: string; count?: number }> {
  const supabase = await createClient();

  // Calcule l'offset pour numéroter à la suite des anonymes existants
  const { count: existing } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true })
    .eq("seance_id", seanceId)
    .eq("mode_ajout", "anonyme");

  const offset = existing ?? 0;

  try {
    const rows = await Promise.all(
      Array.from({ length: count }, async (_, i) => {
        const { tokenId } = await createTokenForParticipant(supabase, offreId, seanceId);
        return {
          seance_id: seanceId,
          token_id: tokenId,
          identifiant_anon: `Participant ${offset + i + 1}`,
          mode_ajout: "anonyme",
        };
      })
    );

    const { error } = await supabase.from("participants").insert(rows);
    if (error) return { error: "Erreur lors de la génération." };

    revalidate(offreId, seanceId);
    return { count: rows.length };
  } catch {
    return { error: "Erreur inattendue." };
  }
}

// ── Import depuis feuille analysée ───────────────────────────

export async function addParticipantsFromSheet(
  seanceId: string,
  offreId: string,
  participants: ParticipantInput[]
): Promise<{ error?: string; count?: number }> {
  const supabase = await createClient();

  try {
    const rows = await Promise.all(
      participants.map(async (p) => {
        const { tokenId } = await createTokenForParticipant(supabase, offreId, seanceId);
        return {
          seance_id: seanceId,
          token_id: tokenId,
          prenom: p.prenom?.trim() || null,
          nom: p.nom?.trim() || null,
          email: p.email?.trim() || null,
          telephone: p.telephone?.trim() || null,
          mode_ajout: "photo",
        };
      })
    );

    const { error } = await supabase.from("participants").insert(rows);
    if (error) return { error: "Erreur lors de l'import." };

    revalidate(offreId, seanceId);
    return { count: rows.length };
  } catch {
    return { error: "Erreur inattendue." };
  }
}

// ── Analyse IA feuille d'émargement ──────────────────────────

export async function analyzeSignatureSheet(
  base64: string,
  mediaType: string
): Promise<{ participants?: ExtractedParticipant[]; error?: string }> {
  try {
    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64,
              },
            },
            {
              type: "text",
              text: 'Tu es un assistant qui extrait des listes de participants depuis des feuilles d\'émargement. Retourne UNIQUEMENT un JSON array : [{"prenom": "", "nom": "", "email": "", "telephone": ""}]. Si un champ est illisible ou absent, retourne null pour ce champ. Ne retourne rien d\'autre que le JSON.',
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") return { error: "Réponse inattendue de l'IA." };

    const text = content.text.trim();
    // Extrait le JSON même si Claude ajoute du texte autour
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return { error: "L'IA n'a pas retourné de liste valide." };

    const participants = JSON.parse(match[0]) as ExtractedParticipant[];
    return { participants };
  } catch (err) {
    console.error("[analyzeSignatureSheet]", err);
    return { error: "Erreur lors de l'analyse. Vérifiez la qualité de l'image." };
  }
}

// ── Clôturer la séance ────────────────────────────────────────

export async function clotureSeance(
  seanceId: string,
  offreId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("seances")
    .update({ statut: "cloturee" })
    .eq("id", seanceId);

  if (error) return { error: "Erreur lors de la clôture." };
  revalidate(offreId, seanceId);
  return {};
}
