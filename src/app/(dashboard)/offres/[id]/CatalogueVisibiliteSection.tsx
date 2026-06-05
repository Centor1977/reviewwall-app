"use client";

import { useState, useTransition } from "react";
import { Lock, ExternalLink, Loader2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateCatalogueVisibiliteAction } from "./catalogueActions";

type Props = {
  offreId: string;
  offreSlug: string;
  catalogueVisible: boolean;
  catalogueForce: boolean;
};

export function CatalogueVisibiliteSection({
  offreId, offreSlug, catalogueVisible, catalogueForce,
}: Props) {
  const [visible, setVisible] = useState(catalogueVisible);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle(next: boolean) {
    setError(null);
    setVisible(next);
    startTransition(async () => {
      const res = await updateCatalogueVisibiliteAction(offreId, next);
      if (res.error) {
        setVisible(!next); // rollback
        setError(res.error);
      }
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
        <BookOpen size={16} className="text-slate-500" />
        Visibilité dans le catalogue
      </h2>

      {catalogueForce ? (
        /* ── Verrouillé : premier avis reçu ── */
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-xs">✓</span>
            <span className="text-sm font-medium text-slate-900">Publiée dans le catalogue</span>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <Lock size={14} className="mt-0.5 shrink-0 text-slate-400" />
            <p>
              Cette formation a des avis vérifiés — elle est définitivement référencée dans le catalogue.
            </p>
          </div>
          <a
            href={`/catalogue`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline transition"
          >
            Voir dans le catalogue <ExternalLink size={13} />
          </a>
        </div>
      ) : (
        /* ── Contrôle libre : pas encore d'avis ── */
        <div className="space-y-4">
          <label className="flex cursor-pointer items-center gap-3">
            {isPending ? (
              <Loader2 size={18} className="animate-spin text-blue-600" />
            ) : (
              <div
                onClick={() => handleToggle(!visible)}
                className={cn(
                  "relative inline-flex h-5 w-9 rounded-full transition-colors",
                  visible ? "bg-blue-600" : "bg-slate-200"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
                  visible ? "left-4" : "left-0.5"
                )} />
              </div>
            )}
            <span className="text-sm font-medium text-slate-700">
              Publier dans le catalogue
            </span>
          </label>

          <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-slate-600">
            <span className="mt-0.5 shrink-0 text-blue-500">ℹ️</span>
            <p>
              Dès que vous recevrez votre premier avis vérifié, cette formation sera
              automatiquement et définitivement publiée dans le catalogue.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
