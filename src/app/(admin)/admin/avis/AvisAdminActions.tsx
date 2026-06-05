"use client";

import { useTransition, useState } from "react";
import { masquerAvis, restaurerAvis, supprimerAvis } from "./actions";

type Props = { id: string; masque: boolean; avisTexte: string };

export function AvisAdminActions({ id, masque, avisTexte }: Props) {
  const [pending, start] = useTransition();
  const [showFull, setShowFull] = useState(false);

  function handleMasquer() {
    if (!window.confirm("Masquer cet avis ? Il ne sera plus visible publiquement.")) return;
    start(() => masquerAvis(id));
  }
  function handleRestaurer() {
    if (!window.confirm("Restaurer cet avis ?")) return;
    start(() => restaurerAvis(id));
  }
  function handleSupprimer() {
    if (!window.confirm("Supprimer définitivement cet avis ? Cette action est irréversible.")) return;
    start(() => supprimerAvis(id));
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button onClick={() => setShowFull(true)} className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">Voir complet</button>
      {masque ? (
        <button onClick={handleRestaurer} disabled={pending} className="rounded border border-green-200 px-2 py-1 text-xs text-green-700 hover:bg-green-50">Restaurer</button>
      ) : (
        <button onClick={handleMasquer} disabled={pending} className="rounded border border-orange-200 px-2 py-1 text-xs text-orange-700 hover:bg-orange-50">Masquer</button>
      )}
      <button onClick={handleSupprimer} disabled={pending} className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50">Supprimer</button>

      {showFull && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 max-h-[80vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Avis complet</h3>
            <p className="text-sm leading-relaxed text-slate-700">{avisTexte || "(pas de texte)"}</p>
            <div className="mt-4 flex justify-end gap-2">
              {masque ? (
                <button onClick={() => { handleRestaurer(); setShowFull(false); }} className="rounded-lg border border-green-200 px-3 py-1.5 text-sm text-green-700 hover:bg-green-50">Restaurer</button>
              ) : (
                <button onClick={() => { handleMasquer(); setShowFull(false); }} className="rounded-lg border border-orange-200 px-3 py-1.5 text-sm text-orange-700 hover:bg-orange-50">Masquer</button>
              )}
              <button onClick={() => setShowFull(false)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
