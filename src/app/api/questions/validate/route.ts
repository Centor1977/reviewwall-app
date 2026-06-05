import { NextResponse } from "next/server";

const aiEnabled =
  process.env.AI_VALIDATION_ENABLED === "true" &&
  Boolean(process.env.ANTHROPIC_API_KEY);

export async function POST(request: Request) {
  try {
    const { texte } = await request.json();
    if (!texte?.trim()) {
      return NextResponse.json({ statut: "error", message: "Question vide." });
    }

    if (!aiEnabled) {
      return NextResponse.json({ statut: "ok", message: null });
    }

    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic();

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `Tu es un validateur de questions pour formulaires d'avis de formation. Analyse cette question et retourne UNIQUEMENT un objet JSON valide (aucun texte autour) : { "statut": "ok" | "warning" | "error", "message": string }

Règles :
- "error" si : données sensibles (santé, origine, handicap, religion, salaire, orientation sexuelle), discriminatoire, non conforme RGPD
- "warning" si : question orientée/biaisée, trop longue (>150 caractères), ambiguë, risque de biais de confirmation
- "ok" si : claire, neutre, pertinente pour évaluer une formation ou prestation

Question à analyser : ${texte}`,
        },
      ],
    });

    const raw = (message.content[0] as { text: string }).text.trim();
    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ statut: "error", message: "Erreur de validation IA." });
  }
}
