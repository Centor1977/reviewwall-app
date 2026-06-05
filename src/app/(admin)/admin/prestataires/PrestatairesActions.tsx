"use client";

import { useTransition, useState } from "react";
import { suspendrePrestataire, reactiverPrestataire, bannirPrestataire, changerPlan } from "./actions";
import Link from "next/link";

type Props = { id: string; statut: string; plan: string; planExpireAt: string | null };

export function PrestatairesActions({ id, statut, plan, planExpireAt }: Props) {
  const [pending, start] = useTransition();
  const [showPlanModal, setShowPlanModal] = useState(false);

  function handleSuspendre() {
    const raison = window.prompt("Raison de la suspension ?");
    if (!raison) return;
    start(() => suspendrePrestataire(id, raison));
  }
  function handleBannir() {
    const raison = window.prompt("Raison du bannissement ? (irréversible sauf action admin)");
    if (!raison) return;
    if (!window.confirm(`Bannir définitivement ce prestataire ?\nRaison : ${raison}`)) return;
    start(() => bannirPrestataire(id, raison));
  }
  function handleReactiver() {
    if (!window.confirm("Réactiver ce prestataire ?")) return;
    start(() => reactiverPrestataire(id));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/admin/prestataires/${id}`} className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">Détail</Link>
      <button onClick={() => setShowPlanModal(true)} disabled={pending} className="rounded border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50">Changer plan</button>
      {statut === "actif" && <button onClick={handleSuspendre} disabled={pending} className="rounded border border-orange-200 px-2 py-1 text-xs text-orange-700 hover:bg-orange-50">Suspendre</button>}
      {statut === "suspendu" && <button onClick={handleReactiver} disabled={pending} className="rounded border border-green-200 px-2 py-1 text-xs text-green-700 hover:bg-green-50">Réactiver</button>}
      {statut !== "banni" && <button onClick={handleBannir} disabled={pending} className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50">Bannir</button>}
      {showPlanModal && <PlanModal id={id} currentPlan={plan} currentExpireAt={planExpireAt} onClose={() => setShowPlanModal(false)} />}
    </div>
  );
}

function PlanModal({ id, currentPlan, currentExpireAt, onClose }: { id: string; currentPlan: string; currentExpireAt: string | null; onClose: () => void }) {
  const [pending, start] = useTransition();
  const [plan, setPlan] = useState(currentPlan);
  const [expireAt, setExpireAt] = useState(currentExpireAt ? currentExpireAt.slice(0, 10) : "");

  function handleSubmit() {
    start(async () => { await changerPlan(id, plan, expireAt || null); onClose(); });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-80 rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-sm font-semibold text-slate-800">Changer le plan</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Plan</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="freemium">Freemium</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="scale">Scale</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Expiration (optionnel)</label>
            <input type="date" value={expireAt} onChange={(e) => setExpireAt(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Annuler</button>
          <button onClick={handleSubmit} disabled={pending} className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800">{pending ? "…" : "Enregistrer"}</button>
        </div>
      </div>
    </div>
  );
}
