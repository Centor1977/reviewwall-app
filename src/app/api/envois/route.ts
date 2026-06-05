import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appConfig } from "@/config/app";
import { sendLienCollecte } from "@/lib/email/send";

type Body = {
  seance_id: string;
  participant_ids: string[];
  objet: string;
  corps: string;
};

function replaceVars(text: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(k, v), text);
}

export async function POST(req: NextRequest) {
  // Vérification préalable de la config Resend
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY manquante dans les variables d'environnement." },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body: Body = await req.json();
  const { seance_id, participant_ids, objet, corps } = body;

  if (!seance_id || !participant_ids?.length || !objet || !corps) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const { data: prestataire } = await supabase
    .from("prestataires")
    .select("id, nom")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!prestataire) return NextResponse.json({ error: "Prestataire introuvable" }, { status: 403 });

  const { data: seance } = await supabase
    .from("seances")
    .select("titre, offres(titre)")
    .eq("id", seance_id)
    .maybeSingle();
  if (!seance) return NextResponse.json({ error: "Séance introuvable" }, { status: 404 });

  const offreTitre =
    (Array.isArray(seance.offres)
      ? seance.offres[0]?.titre
      : (seance.offres as { titre: string } | null)?.titre) ?? "";

  const { data: participants } = await supabase
    .from("participants")
    .select("id, prenom, nom, email, collecte_tokens(token)")
    .in("id", participant_ids)
    .eq("seance_id", seance_id);

  if (!participants?.length) {
    return NextResponse.json({ error: "Aucun participant trouvé" }, { status: 404 });
  }

  let envoyes = 0;
  const echecsDetails: { participant: string; raison: string }[] = [];
  const now = new Date().toISOString();

  for (const p of participants) {
    const nom = [p.prenom, p.nom].filter(Boolean).join(" ") || "Participant";

    const token = Array.isArray(p.collecte_tokens)
      ? p.collecte_tokens[0]?.token
      : (p.collecte_tokens as { token: string } | null)?.token;

    if (!p.email) {
      echecsDetails.push({ participant: nom, raison: "Pas d'email" });
      continue;
    }
    if (!token) {
      echecsDetails.push({ participant: nom, raison: "Token de collecte introuvable" });
      continue;
    }

    const collectUrl = `${appConfig.url}/collect/${token}`;
    const prenom = p.prenom ?? "Participant";

    const vars: Record<string, string> = {
      "[prénom]": prenom,
      "[nom]": p.nom ?? "",
      "[formation]": offreTitre,
      "[séance]": seance.titre,
      "[lien]": collectUrl,
    };

    const objetFinal = replaceVars(objet, vars);
    const corpsFinal = replaceVars(corps, vars);

    try {
      await sendLienCollecte({
        email: p.email,
        prenom,
        corps: corpsFinal,
        collectUrl,
        nomFormateur: prestataire.nom,
        objet: objetFinal,
      });

      await supabase.from("envois").insert({
        seance_id,
        participant_id: p.id,
        objet: objetFinal,
        corps: corpsFinal,
        canal: "email",
        statut: "envoye",
      });

      await supabase
        .from("participants")
        .update({ dernier_envoi_at: now })
        .eq("id", p.id);

      envoyes++;
    } catch (err) {
      const raison = err instanceof Error ? err.message : "Erreur inconnue";
      console.error(`[envoi] échec pour ${p.email}:`, raison);

      echecsDetails.push({ participant: nom, raison });

      await supabase.from("envois").insert({
        seance_id,
        participant_id: p.id,
        objet: objetFinal,
        corps: corpsFinal,
        canal: "email",
        statut: "echec",
      });
    }
  }

  return NextResponse.json({
    success: true,
    envoyes,
    echecs: echecsDetails.length,
    echecsDetails,
  });
}
