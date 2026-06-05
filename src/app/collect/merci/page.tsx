import { appConfig } from "@/config/app";
import { MerciClient } from "./MerciClient";

type SearchParams = { email?: string; prenom?: string; offre?: string };

export default async function MerciPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { email, prenom, offre } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Succès */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Merci {prenom ? prenom : ""}!
          </h1>
          <p className="mt-2 text-sm text-gray-500">Votre avis a bien été enregistré.</p>
          {offre && <p className="mt-1 text-xs text-gray-400">{offre}</p>}
        </div>

        {/* Bloc création compte */}
        <MerciClient email={email ?? null} appName={appConfig.name} appUrl={appConfig.url} />

        <p className="mt-6 text-center text-xs text-gray-400">
          Propulsé par{" "}
          <a href={appConfig.url} className="hover:underline">{appConfig.name}</a>
        </p>
      </div>
    </div>
  );
}
