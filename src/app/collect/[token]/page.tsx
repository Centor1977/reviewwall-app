import { createClient } from "@supabase/supabase-js";
import { appConfig } from "@/config/app";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import CollectForm from "./CollectForm";

type Params = { token: string };

function publicClient() {
  return createClient(
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

  const { data: tokenRow } = await supabase
    .from("collecte_tokens")
    .select("id, used, offre_id")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || tokenRow.used) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm text-center">
          <p className="mb-4 text-5xl">🔒</p>
          <h1 className="mb-2 text-xl font-semibold text-gray-900">
            Lien invalide
          </h1>
          <p className="text-sm text-gray-500">
            Ce lien est invalide ou a déjà été utilisé.
          </p>
        </div>
      </div>
    );
  }

  const { data: offre } = await supabase
    .from("offres")
    .select("titre, vertical")
    .eq("id", tokenRow.offre_id)
    .maybeSingle();

  const vertical = VERTICALS[(offre?.vertical as Vertical) ?? DEFAULT_VERTICAL];
  const clientLabel = vertical.client.singular;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="mb-8 text-center">
          <span className="text-lg font-bold text-gray-900">
            {appConfig.name}
          </span>
          {offre?.titre && (
            <p className="mt-1 text-sm text-gray-500">{offre.titre}</p>
          )}
          <p className="mt-3 text-sm text-gray-400">
            Votre avis est anonyme et aide les futurs {clientLabel}s.
          </p>
        </div>

        <CollectForm
          token={token}
          offreId={tokenRow.offre_id}
          vertical={vertical}
        />
      </div>
    </div>
  );
}
