import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { appConfig } from "@/config/app";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import CollectForm from "./CollectForm";

type Params = { token: string };

function publicClient() {
  return createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export default async function CollectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { token } = await params;
  const supabase = publicClient();

  const { data: tokenRow, error: tokenError } = await supabase
    .from("collecte_tokens")
    .select("id, used, offre_id")
    .eq("token", token)
    .maybeSingle();

  if (tokenError) {
    console.error("[collect] token query error:", tokenError.message);
  }

  if (!tokenRow || tokenRow.used) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm text-center">
          <p className="mb-4 text-5xl">🔒</p>
          <h1 className="mb-2 text-xl font-semibold text-gray-900">Lien invalide</h1>
          <p className="text-sm text-gray-500">
            Ce lien est invalide ou a déjà été utilisé.
          </p>
        </div>
      </div>
    );
  }

  const { data: offre } = await supabase
    .from("offres")
    .select("titre, vertical, prestataires(nom)")
    .eq("id", tokenRow.offre_id)
    .maybeSingle();

  const { data: questionsRaw } = await supabase
    .from("offre_questions")
    .select(`id, visibilite, question:questions_bibliotheque(id, texte, type_reponse, options, dimension_profil, utilisable_matching)`)
    .eq("offre_id", tokenRow.offre_id)
    .order("ordre", { ascending: true });

  let prenom: string | null = null;
  let seanceTitre: string | null = null;

  try {
    const { data: participant } = await supabase
      .from("participants")
      .select("prenom, identifiant_anon, seance_id")
      .eq("token_id", tokenRow.id)
      .maybeSingle();

    prenom = participant?.prenom ?? participant?.identifiant_anon ?? null;

    if (participant?.seance_id) {
      const { data: seance } = await supabase
        .from("seances")
        .select("titre")
        .eq("id", participant.seance_id)
        .maybeSingle();
      seanceTitre = seance?.titre ?? null;
    }
  } catch {
    // Tables pas encore créées — on continue sans personnalisation
  }

  const verticalKey = (offre?.vertical as Vertical) ?? DEFAULT_VERTICAL;
  const vertical = VERTICALS[verticalKey];
  const prestRaw = offre?.prestataires as { nom?: string } | { nom?: string }[] | null | undefined;
  const prestataireName = (Array.isArray(prestRaw) ? prestRaw[0]?.nom : prestRaw?.nom) ?? "";

  // Pré-remplissage si l'utilisateur est connecté comme apprenant
  let prefillProfil: Record<string, string> = {};
  try {
    const auth = await createAuthClient();
    const { data: { user } } = await auth.auth.getUser();
    if (user) {
      const { data: apprenant } = await auth
        .from("apprenants")
        .select("id, age_range, situation")
        .eq("user_id", user.id)
        .maybeSingle();

      if (apprenant) {
        const { data: vprofil } = await auth
          .from("apprenant_profils_verticales")
          .select("profil")
          .eq("apprenant_id", apprenant.id)
          .eq("vertical", verticalKey)
          .maybeSingle();

        prefillProfil = {
          ...(apprenant.age_range ? { age_range: apprenant.age_range } : {}),
          ...(apprenant.situation ? { situation: apprenant.situation } : {}),
          ...(vprofil?.profil ?? {}),
        };
      }
    }
  } catch {
    // Non bloquant — pré-remplissage optionnel
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="mb-8 text-center">
          <span className="text-lg font-bold text-gray-900">{appConfig.name}</span>

          {prenom && (
            <p className="mt-3 text-base font-medium text-gray-800">
              Bonjour {prenom},
            </p>
          )}

          {offre?.titre && (
            <p className="mt-1 text-sm font-medium text-gray-600">{offre.titre}</p>
          )}

          {seanceTitre && (
            <p className="mt-0.5 text-xs text-gray-400">{seanceTitre}</p>
          )}

          <p className="mt-3 text-sm text-gray-400">
            Votre avis est anonyme et aide les futurs {vertical.client.singular}s.
          </p>
        </div>

        <CollectForm
          token={token}
          offreId={tokenRow.offre_id}
          vertical={vertical}
          verticalKey={verticalKey}
          prenom={prenom}
          prefillProfil={prefillProfil}
          questions={(questionsRaw ?? []).map((oq) => ({
            id: oq.id as string,
            visibilite: oq.visibilite as "publique" | "privee",
            question: (Array.isArray(oq.question) ? oq.question[0] : oq.question) as {
              id: string; texte: string; type_reponse: string; options: string[] | null;
              dimension_profil: string | null; utilisable_matching: boolean;
            },
          }))}
          prestataireName={prestataireName}
        />
      </div>
    </div>
  );
}
