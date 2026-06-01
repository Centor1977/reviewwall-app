"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteAccountAction } from "./actions";

export function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const result = await deleteAccountAction();
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      setConfirming(false);
    }
    // On success, server action redirects to "/"
  }

  return (
    <div className="rounded-xl border border-red-200 bg-white p-6">
      <div className="mb-5 border-b border-slate-100 pb-4">
        <h2 className="text-base font-semibold text-red-600">Zone de danger</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Actions irréversibles — à utiliser avec précaution.
        </p>
      </div>

      {!confirming ? (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Supprimer mon compte
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Supprime définitivement votre compte, vos formations et tous vos
              avis.
            </p>
          </div>
          <button
            onClick={() => setConfirming(true)}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            <Trash2 size={14} />
            Supprimer mon compte
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <div className="mb-4 flex items-start gap-3">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-red-500"
            />
            <div>
              <p className="text-sm font-semibold text-red-700">
                Êtes-vous sûr de vouloir supprimer votre compte ?
              </p>
              <p className="mt-1 text-xs text-red-600">
                Cette action est irréversible. Toutes vos données (formations,
                avis, liens de collecte) seront définitivement supprimées.
              </p>
            </div>
          </div>

          {error && (
            <p className="mb-3 text-xs text-red-700">
              Erreur : {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Suppression…
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Confirmer la suppression
                </>
              )}
            </button>
            <button
              onClick={() => {
                setConfirming(false);
                setError(null);
              }}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-colors duration-150 hover:bg-slate-50"
            >
              <X size={14} />
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
