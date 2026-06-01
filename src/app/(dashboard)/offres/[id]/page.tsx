import { notFound } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { ensurePrestataire } from "@/lib/supabase/ensure-prestataire";
import { VERTICALS, DEFAULT_VERTICAL, type Vertical } from "@/config/verticals";
import { appConfig } from "@/config/app";
import { cn } from "@/lib/utils";
import { ArrowLeft, Link2, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { CopyButton } from "./CopyButton";
import { QrCodeToken } from "./QrCodeToken";

type Params = { id: string };

type Token = {
  id: string;
  token: string;
  email_client: string | null;
  used: boolean;
  created_at: string;
};

export default async function OffreDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const prestataire = await ensurePrestataire(supabase, user!.id);
  if (!prestataire) notFound();

  const { data: offre } = await supabase
    .from("offres")
    .select("*")
    .eq("id", id)
    .eq("prestataire_id", prestataire.id)
    .maybeSingle();

  if (!offre) notFound();

  const { data: tokens } = await supabase
    .from("collecte_tokens")
    .select("id, token, email_client, used, created_at")
    .eq("offre_id", id)
    .order("created_at", { ascending: false });

  const tokenList = (tokens ?? []) as Token[];

  const vertical = VERTICALS[(prestataire.vertical as Vertical) ?? DEFAULT_VERTICAL];
  const clientLabel = vertical.client.singular;

  async function generateToken() {
    "use server";
    const supabase = await createClient();
    const token = nanoid(12);
    await supabase.from("collecte_tokens").insert({ token, offre_id: id });
    revalidatePath(`/offres/${id}`);
  }

  const publicUrl = `${appConfig.url}/f/${offre.slug}`;
  const widgetUrl = `${appConfig.url}/widget/${offre.slug}`;
  const iframeCode = `<iframe\n  src="${widgetUrl}"\n  width="100%"\n  height="500"\n  frameborder="0"\n  style="border:none;"\n  loading="lazy"\n></iframe>`;

  return (
    <div className="max-w-2xl">
      {/* Retour */}
      <Link
        href="/offres"
        className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900"
      >
        <ArrowLeft size={15} />
        Retour aux {vertical.offre.plural}
      </Link>

      {/* Infos offre */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{offre.titre}</h1>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  offre.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                )}
              >
                {offre.active ? "Actif" : "Inactif"}
              </span>
            </div>
            {offre.categorie && (
              <p className="mt-1 text-sm text-gray-500">{offre.categorie}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <CopyButton text={publicUrl} />
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <ExternalLink size={13} />
              Fiche publique
            </a>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <code className="min-w-0 flex-1 truncate text-xs text-gray-500">{publicUrl}</code>
        </div>

        {offre.description && (
          <p className="mt-4 text-sm text-gray-600">{offre.description}</p>
        )}

        {offre.url_externe && (
          <a
            href={offre.url_externe}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <Link2 size={14} />
            {offre.url_externe}
          </a>
        )}
      </div>

      {/* Liens de collecte */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Liens de collecte</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              Chaque lien est à usage unique — un lien par {clientLabel}.
            </p>
          </div>
          <form action={generateToken}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
            >
              <Link2 size={13} />
              Générer un lien
            </button>
          </form>
        </div>

        {tokenList.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            Aucun lien généré. Cliquez sur &quot;Générer un lien&quot; pour créer le premier.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {tokenList.map((t) => {
              const collectUrl = `${appConfig.url}/collect/${t.token}`;
              return (
                <li key={t.id} className="flex items-center gap-4 py-4">
                  <QrCodeToken url={collectUrl} token={t.token} />
                  <div className="min-w-0 flex-1">
                    <code className="block truncate rounded bg-gray-50 px-2 py-1 text-xs text-gray-600 font-mono">
                      {collectUrl}
                    </code>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                      {t.used ? (
                        <>
                          <CheckCircle2 size={11} className="text-green-500" />
                          <span className="text-green-600">Utilisé</span>
                        </>
                      ) : (
                        <>
                          <Clock size={11} />
                          <span>En attente</span>
                        </>
                      )}
                    </div>
                  </div>
                  <CopyButton text={collectUrl} />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Intégrer le widget */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">Intégrer le widget</h2>
        <p className="mt-0.5 text-xs text-gray-400">
          Affichez vos avis directement sur votre site.
        </p>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-700">Option A — Iframe (recommandé)</p>
            <CopyButton text={iframeCode} />
          </div>
          <pre className="overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
            {iframeCode}
          </pre>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-400">Option B — Snippet JS</p>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
              Bientôt disponible
            </span>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-300 select-none">
            {"// Snippet JS — bientôt disponible"}
          </pre>
        </div>
      </div>
    </div>
  );
}
