import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  try {
    const { titre, categorie, format, niveau, vertical } = await request.json();

    if (!titre?.trim()) {
      return NextResponse.json({ error: "Titre requis pour la génération." }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system:
        "Tu es un expert en ingénierie pédagogique et en rédaction de fiches de formation professionnelles françaises. " +
        "Tu génères du contenu clair, professionnel et orienté résultats. " +
        "Tu t'inspires des meilleures pratiques Udemy, Coursera et Qualiopi.",
      messages: [
        {
          role: "user",
          content:
            `Génère le contenu pour une fiche de formation avec ces informations :\n` +
            `- Titre : ${titre}\n` +
            (categorie ? `- Catégorie : ${categorie}\n` : "") +
            (format   ? `- Format : ${format}\n`    : "") +
            (niveau   ? `- Niveau : ${niveau}\n`    : "") +
            `\nRetourne UNIQUEMENT un objet JSON valide (aucun texte autour) avec ces champs :\n` +
            `{\n` +
            `  "description_courte": "string (max 200 chars, accroche percutante)",\n` +
            `  "description_longue": "string (markdown, 3-4 paragraphes : contexte, approche pédagogique, bénéfices, public visé)",\n` +
            `  "objectifs": ["string"] (5-7 objectifs commençant par un verbe d'action : Maîtriser, Comprendre, Appliquer…),\n` +
            `  "prerequis": ["string"] (2-4 prérequis réalistes, [] si aucun),\n` +
            `  "public_cible": "string (1-2 phrases)",\n` +
            `  "competences": ["string"] (5-8 compétences courtes),\n` +
            `  "programme": [{"titre": "string", "contenu": "string"}] (4-6 modules cohérents)\n` +
            `}`,
        },
      ],
    });

    const raw = (message.content[0] as { text: string }).text.trim();
    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[generer]", err);
    return NextResponse.json({ error: "Erreur lors de la génération." }, { status: 500 });
  }
}
