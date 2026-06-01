import Link from "next/link";
import { appConfig } from "@/config/app";
import { VERTICALS } from "@/config/verticals";

export default function MerciPage() {
  const clientLabel = VERTICALS.formation.client.singular;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm text-center">
        <p className="mb-5 text-6xl">🎉</p>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Merci pour votre avis !
        </h1>
        <p className="text-sm text-gray-500">
          Votre retour aide les futurs {clientLabel}s à faire le bon choix.
        </p>
        <p className="mt-8 text-xs text-gray-400">
          Propulsé par{" "}
          <Link href={appConfig.url} className="hover:underline">
            {appConfig.name}
          </Link>
        </p>
      </div>
    </div>
  );
}
