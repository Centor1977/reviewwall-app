"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

const RAISONS = [
  { value: "spam", label: "Spam" },
  { value: "faux_avis", label: "Faux avis" },
  { value: "contenu_inapproprie", label: "Contenu inapproprié" },
  { value: "autre", label: "Autre" },
] as const;

type State = "idle" | "open" | "pending" | "done" | "error";

export function SignalerButton({ avisId }: { avisId: string }) {
  const [state, setState] = useState<State>("idle");
  const [raison, setRaison] = useState<string>("spam");
  const [detail, setDetail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("pending");
    try {
      const res = await fetch("/api/signalements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avisId, raison, detail }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? "Erreur serveur"
        );
      }
      setState("done");
    } catch (err) {
      console.error(err);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="text-xs text-gray-400">
        Signalement envoyé — merci.
      </p>
    );
  }

  return (
    <>
      <button
        onClick={() => setState("open")}
        className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600"
      >
        <Flag size={11} />
        Signaler cet avis
      </button>

      {(state === "open" || state === "pending" || state === "error") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-80 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-sm font-semibold text-gray-800">
              Signaler cet avis
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Raison
                </label>
                <select
                  value={raison}
                  onChange={(e) => setRaison(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  {RAISONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Détail (optionnel)
                </label>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Précisez votre signalement…"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
                />
              </div>

              {state === "error" && (
                <p className="text-xs text-red-600">
                  Une erreur s&apos;est produite. Réessayez.
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setState("idle")}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={state === "pending"}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {state === "pending" ? "Envoi…" : "Signaler"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
