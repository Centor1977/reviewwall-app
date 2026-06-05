"use client";

import { useTransition, useState } from "react";
import { traiterSignalement, rejeterSignalement } from "./actions";

type Props = { signalementId: string; avisId: string; avisTexte: string; avisDejamasque: boolean };

export function SignalementActions({ signalementId, avisId, avisTexte, avisDejamasque }: Props) {
  const [pending, start] = useTransition();
  const [showFull, setShowFull] = useState(false);

  function handleMasquerEtTraiter() {
    if (!window.confirm("Masquer l'avis et marquer ce signalement comme traité ?")) return;
    start(() => traiterSignalement(signalementId, avisId));
  }
  function handleRejeter() {
    if (!window.confirm("Rejeter ce signalement (l'avis restera visible) ?")) return;
    start(() => rejeterSignalement(signalementId));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={() => setShowFull(true)} className="rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">Voir l&apos;avis complet</button>
      {!avisDejamasque && (
        <button onClick={handleMasquerEtTraiter} disabled={pending} className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">
          {pending ? "…" : "Masquer l'avis"}
        </button>
      )}
      <button onClick={handleRejeter} disabled={pending} className="rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50">
        {pending ? "…" : "Rejeter le signalement"}
      </button>
      {showFull && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 max-h-[80vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Avis complet</h3>
            <p className="text-sm leading-relaxed text-slate-700">{avisTexte || "(pas de texte)"}</p>
            <button onClick={() => setShowFull(false)} className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
